import { Flex } from "antd";
import { generate } from "@ant-design/colors";
import { CircleFadingPlus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ButtonAddNewTypeofGoal from "./typeofGoalAdd/buttonAddNewTypeofGoal";
import TypeofGoalUpdate from "./typeofGoalUpdate/typeofGoalUpdate";
import { GoalType } from "../../../types/Goal/GoalType";
import { TypeofGoal } from "../../../types/Goal/TypeofGoal";

interface TypeOfGoalProps {
    idGoal?: number | undefined;
    maxItem?: number;
    typeofGoalData: TypeofGoal[];
    allTypeofGoalData: TypeofGoal[];
    goal: GoalType;
    loadGoal: () => void;
    loadTypeofGoal: () => void;
}

const TypeOfGoal = ({ idGoal, typeofGoalData, maxItem = typeofGoalData.length, goal, loadGoal, allTypeofGoalData, loadTypeofGoal }: TypeOfGoalProps) => {
    let amountTypeofGoal = typeofGoalData.length;
    const [isModalTypeofGoalUpdateOpen, setIsModalTypeofGoalUpdateOpen] = useState(false);


    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(typeofGoalData.length);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const tags = container.querySelectorAll(".type-tag");
        let count = 0;

        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i] as HTMLElement;
            // offsetTop là tính điểm bắt đầu hiển thị tag (khoảng cách của container cha đến đỉnh của tag đó)
            // offsetHeight là chiều cao của tag đó (điểm kết thúc của tag)
            if (tag.offsetTop + tag.offsetHeight <= container.offsetHeight) {
                count++;
            } else {
                break;
            }
        }

        setVisibleCount(count);
    }, [typeofGoalData]);

    return (

        <Flex gap="4px 0" wrap align="center" ref={containerRef}
            style={{
                height: "56px",
                maxHeight: "56px",
                overflow: "hidden",
                position: "relative",
            }}>
            {typeofGoalData && typeofGoalData.length > 0 ? (
                typeofGoalData.map(type => {
                    const palette = generate(type?.theme || '#0958d9');
                    return (
                        // Way 1
                        // <div className="p-1 text-sm border rounded"
                        //     style={{
                        //         color: palette[5],
                        //         borderColor: palette[3],
                        //         backgroundColor: palette[1],
                        //     }}

                        // Way 2
                        <div
                            onClick={() => setIsModalTypeofGoalUpdateOpen(true)}
                            key={type.idTypeGoal}
                            className=" type-tag
                                        px-2 py-0.5 text-sm rounded border cursor-pointer mr-1
                                        [color:var(--primary)]
                                        [border-color:color-mix(in_oklch,var(--primary)_35%,white)]
                                        [background-color:color-mix(in_oklch,var(--primary)_12%,white)]
                                    "
                            style={
                                {
                                    '--primary': type?.theme || '#1677ff',
                                    fontWeight: 400,
                                } as React.CSSProperties
                            }
                        >
                            {
                                type?.nameType
                            }
                        </div>
                    );
                })
            ) : <div
                className="cursor-pointer p-1 text-sm rounded border text-[#0958d9] border-[#91caff] bg-[#e6f4ff]"
                onClick={() => setIsModalTypeofGoalUpdateOpen(true)}
            >
                No type
            </div>
            }
            {/* {
                (amountTypeofGoal > maxItem) ?
                    <div className="flex items-center w-6 h-6 p-1 bg-amber-200 rounded-3xl">
                        <span className="text-xs font-medium text-gray-500">{amountTypeofGoal - maxItem}</span>
                        <Plus color="#858585" size={"13px"} style={{}} />
                    </div>
                    :
                    // <div className="text-xl">
                    //     <ButtonAddNewTypeofGoal
                    //         idGoal={idGoal}
                    //         goalData={goal}
                    //         loadGoal={loadGoal}
                    //     />
                    // </div>
                    <></>
            } */}

            {(typeofGoalData.length > visibleCount) && (
                <div className="absolute bottom-0 right-0 z-10 flex items-center w-6 h-6 p-1 cursor-pointer bg-amber-200 rounded-3xl" onClick={() => setIsModalTypeofGoalUpdateOpen(true)}>
                    <span className="text-xs font-medium text-gray-500">
                        {typeofGoalData.length - visibleCount}
                    </span>
                    <Plus color="#858585" size="13px" />
                </div>
            )}

            {/*Modal Update and Delete TypeofGoal*/}
            <div>
                <TypeofGoalUpdate
                    isModalTypeofGoalUpdateOpen={isModalTypeofGoalUpdateOpen}
                    setIsModalTypeofGoalUpdateOpen={setIsModalTypeofGoalUpdateOpen}
                    typeofGoalData={typeofGoalData}
                    goal={goal}
                    loadGoal={loadGoal}
                    allTypeofGoalData={allTypeofGoalData}
                    loadTypeofGoal={loadTypeofGoal}
                />
            </div>
        </Flex>
    );
}

export default TypeOfGoal;