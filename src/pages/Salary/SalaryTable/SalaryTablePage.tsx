import Iridescence from "@components/layout/background/Iridescence";

export const SalaryTablePage = () => {
    return (
        <>
            <div className="relative w-full h-screen overflow-hidden">
                <Iridescence color={[0.8, 0.9, 1]} mouseReact={false} amplitude={0.15} speed={1.0} />

                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    <h1 className="text-3xl font-bold text-white">Hello Salary Table Page</h1>
                </div>
            </div>
        </>
    );
}

