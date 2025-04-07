import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';
import JSZip from "jszip";
import { saveAs } from "file-saver";


export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  const generateZip = async () => {
    const zip = new JSZip();
  
    const processFiles = (folder: JSZip, files: FileItem[]) => {
      files.forEach(file => {
        if (file.type === "folder" && file.children) {
          // Create a folder inside the zip
          const subFolder = folder.folder(file.name);
          processFiles(subFolder!, file.children);
        } else if (file.type === "file") {
          // Add file content
          folder.file(file.name, file.content || "");
        }
      });
    };
  
    processFiles(zip, files);
  
    // Generate the ZIP file and trigger download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "project.zip");
  };
  
  useEffect(() => {
    console.log("Steps updated:", steps); // Log every step update
  
    let updateHappened = false;
    let newFiles = [...files]; // Copy existing files
  
    steps.forEach((step) => {
      if (step.status === "pending") {
        updateHappened = true;
  
        if (step.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = newFiles;
          let currentFolder = "";
  
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);
  
            if (!parsedPath.length) {
              // Final file
              let file = currentFileStructure.find((x) => x.path === currentFolder);
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              // Folder handling
              let folder = currentFileStructure.find((x) => x.path === currentFolder);
              if (!folder) {
                folder = {
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                };
                currentFileStructure.push(folder);
              }
  
              currentFileStructure = folder.children!;
            }
          }
        }
      }
    });
  
    if (updateHappened) {
      console.log("Updating files with new content:", newFiles);
      setFiles([...newFiles]); // Ensure React registers the update
      setSteps((prevSteps) =>
        prevSteps.map((s) => ({
          ...s,
          status: "completed",
        }))
      );
    }
  }, [steps]); 

  useEffect(() => {
    console.log("Files before mounting:", files); // Ensure files have content
  
    if (!webcontainer || files.length === 0) {
      console.warn("Skipping WebContainer mount: WebContainer not ready or files empty");
      return;
    }
  
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
    
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(file.children.map(child => [child.name, processFile(child, false)]))
              : {}
          };
        } else if (file.type === 'file') {
          return {
            file: { contents: file.content || '' }
          };
        }
        return mountStructure[file.name];
      };
  
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
    console.log("Final mount structure:", mountStructure);
  
    webcontainer.mount(mountStructure)
      .then(() => {
        console.log("Successfully mounted to WebContainer");
        return webcontainer.spawn('npm', ['install']);
      })
      .then(installProcess => {
        console.log("Running npm install...");
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log("npm install output:", data);
          }
        }));
      })
      .catch(error => {
        console.error("Error during WebContainer operations:", error);
      });
  
  }, [files, webcontainer]);
  

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
  
    const {prompts, uiPrompts} = response.data;
    const parsedSteps = parseXml(uiPrompts[0]);
    console.log("Parsed Steps:", parsedSteps);
    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, {role: "user", content: stepsResponse.data.response}])
  }

  useEffect(() => {
    if (webcontainer) {
      init();
    }
  }, [webcontainer]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gray-200 border-b border-gray-300 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Website Builder</h1>
        <p className="text-sm text-gray-600 mt-1">Prompt: {prompt}</p>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="flex flex-col max-h-[75vh] overflow-scroll">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
              <div className="flex flex-col">
                <div className='flex w-full'>
                  <br />
                  {(loading || !templateSet) && <Loader />}
                  {!(loading || !templateSet) && <div className='flex flex-col'>
                    <textarea value={userPrompt} onChange={(e) => {
                    setPrompt(e.target.value)
                  }} className='p-2 border-2 border-gray-300 rounded-md w-full'></textarea>
                    <button onClick={async () => {
                      const newMessage = {
                        role: "user" as "user",
                        content: userPrompt
                      };

                      setLoading(true);
                      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                        messages: [...llmMessages, newMessage].map(msg => ({
                          role: msg.role,
                          content: [{ data: msg.content }]
                        }))
                      });
                      setLoading(false);

                      setLlmMessages(x => [...x, newMessage]);
                      setLlmMessages(x => [...x, {
                        role: "assistant",
                        content: stepsResponse.data.response
                      }]);

                      setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                        ...x,
                        status: "pending" as "pending"
                      }))]);

                    }} className='bg-purple-400 px-4 py-2 rounded-md mt-4'>Send</button>
                  </div>}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <button 
              onClick={generateZip} 
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-0 mb-1"
            >
              Download Code as ZIP
            </button>
            <FileExplorer 
              files={files} 
              onFileSelect={setSelectedFile}
            />
          </div>
          <div className="col-span-2 bg-gray-200 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {activeTab === 'code' ? (
                <CodeEditor file={selectedFile} />
              ) : webcontainer ? (
                <PreviewFrame webContainer={webcontainer} files={files} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600">Loading preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}