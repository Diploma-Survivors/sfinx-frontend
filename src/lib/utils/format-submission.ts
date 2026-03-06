export const formatRuntime = (runtime?: number | null) => {
    if (runtime === undefined || runtime === null || isNaN(runtime)) return "N/A";
    if (runtime === 0) return "0 ms";
    return `${Number(runtime).toFixed(2)} ms`;
};

export const formatMemory = (memory?: number | null) => {
    if (memory === undefined || memory === null || isNaN(memory)) return "N/A";
    if (memory === 0) return "0 KB";
    return `${memory} KB`;
};
