import OnboardingTutorial from "../components/OnboardingTutorial";

export const metadata = {
    title: "Scaffold Builder",
};

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <OnboardingTutorial />
            {children}
        </>
    );
}
