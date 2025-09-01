import React from 'react';

interface Suggestion {
    type: "good" | "improve";
    tip: string;
}

interface ATSProps {
    score: number;
    suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
    // Determine gradient, icon, and subtitle based on score
    const gradient = score > 69
        ? 'from-green-100 to-green-50'
        : score > 49
            ? 'from-yellow-100 to-yellow-50'
            : 'from-red-100 to-red-50';

    const icon = score > 69
        ? '/icons/ats-good.svg'
        : score > 49
            ? '/icons/ats-warning.svg'
            : '/icons/ats-bad.svg';

    const subtitle = score > 69
        ? 'Great Job!'
        : score > 49
            ? 'Good Start'
            : 'Needs Improvement';

    return (
        <div className={`bg-gradient-to-b ${gradient} rounded-2xl shadow-md w-full p-6`}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <img src={icon} alt="" aria-hidden="true" className="w-12 h-12" />
                <h2 className="text-2xl font-bold">ATS Score - {score}/100</h2>
            </div>

            {/* Subtitle & description */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>
                <p className="text-gray-600 mb-4">
                    This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
                </p>

                {/* Suggestions */}
                <div className="space-y-3">
                    {suggestions.map((s) => (
                        <div key={s.tip} className="flex items-start gap-3">
                            <img
                                src={s.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                                alt=""
                                aria-hidden="true"
                                className="w-5 h-5 mt-1"
                            />
                            <p className={s.type === "good" ? "text-green-700" : "text-amber-700"}>
                                {s.tip}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Encouragement */}
            <p className="text-gray-700 italic">
                Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
            </p>
        </div>
    );
};

export default ATS;
