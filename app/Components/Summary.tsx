import ScoreGauge from "~/Components/ScoreGauge";
import ScoreBadge from "~/Components/ScoreBadge";

interface CategoryProps {
    title: string;
    score: number;
}

const Category: React.FC<CategoryProps> = ({ title, score }) => {
    const textColor =
        score > 70 ? "text-green-600" : score > 49 ? "text-yellow-600" : "text-red-600";

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-2xl">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-2xl">
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    );
};

interface SummaryProps {
    feedback: Feedback;
}

const Summary: React.FC<SummaryProps> = ({ feedback }) => {
    const { overallScore, toneAndStyle, content, structure, skills } = feedback;

    return (
        <div className="bg-white rounded-2xl shadow-md w-full">
            <div className="flex flex-row items-center p-4 gap-8">
                <ScoreGauge score={overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Your Resume Score</h2>
                    <p className="text-sm text-gray-500">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <Category title="Tone & Style" score={toneAndStyle.score} />
            <Category title="Content" score={content.score} />
            <Category title="Structure" score={structure.score} />
            <Category title="Skills" score={skills.score} />
        </div>
    );
};

export default Summary;
