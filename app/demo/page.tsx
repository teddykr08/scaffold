"use client";

import { useState } from "react";
import BuilderDashboardUI from "../components/BuilderDashboardUI";

type AppRow = {
    id: string;
    name: string;
    task_count: number;
};

export default function BuilderDemoPage() {
    const [apps, setApps] = useState<AppRow[]>([
        { id: "1", name: "Study Tutor", task_count: 3 },
        { id: "2", name: "Recipe Genius", task_count: 1 },
        { id: "3", name: "Personal Trainer", task_count: 2 },
    ]);

    const createApp = (name: string) => {
        const newApp: AppRow = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            task_count: 0
        };
        setApps([...apps, newApp]);
    };

    return (
        <BuilderDashboardUI
            apps={apps}
            onAppClick={(id) => console.log("Demo click:", id)}
            onCreateApp={createApp}
            isDemo={true}
        />
    );
}
