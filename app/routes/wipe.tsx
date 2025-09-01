import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [statusText, setStatusText] = useState("");

    const loadFiles = async () => {
        try {
            const existingFiles = (await fs.readDir("./")) as FSItem[];
            setFiles(existingFiles || []);
            setStatusText("");
        } catch (err) {
            console.error(err);
            setStatusText("Failed to load files.");
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading, auth.isAuthenticated, navigate]);

    const handleDelete = async () => {
        if (files.length === 0) {
            setStatusText("No files to delete.");
            return;
        }

        setStatusText("Deleting files...");
        try {
            await Promise.all(files.map((file) => fs.delete(file.path)));
            await kv.flush();
            setStatusText("All files deleted successfully.");
            setFiles([]);
        } catch (err) {
            console.error(err);
            setStatusText("Failed to wipe app data.");
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Authenticated as: {auth.user?.username || "Unknown"}
            </h1>

            {statusText && <p className="mb-4 text-red-600">{statusText}</p>}

            <div className="mb-4">
                <h2 className="font-semibold">Existing files:</h2>
                <div className="flex flex-col gap-2 mt-2">
                    {files.length === 0 ? (
                        <p>No files found.</p>
                    ) : (
                        files.map((file) => (
                            <div key={file.id} className="flex flex-row gap-4">
                                <p>{file.name}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button
                className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-red-600 transition"
                onClick={handleDelete}
            >
                Wipe App Data
            </button>
        </div>
    );
};

export default WipeApp;
