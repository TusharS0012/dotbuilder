import { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";

let globalInstance: WebContainer | null = null;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

    useEffect(() => {
        async function initWebContainer() {
            if (!globalInstance) {
                try {
                    globalInstance = await WebContainer.boot();
                    setWebcontainer(globalInstance);
                    console.log("✅ WebContainer initialized successfully");
                } catch (error) {
                    console.error("❌ WebContainer failed to initialize:", error);
                }
            } else {
                setWebcontainer(globalInstance);
            }
        }

        initWebContainer();
    }, []);

    return webcontainer;
}
