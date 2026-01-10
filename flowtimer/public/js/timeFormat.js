// formatting text inside timer, MM:SS format

export function formatTime(seconds){ // used for the timer, especially the center text. since we're not using the default 0-100 for the circular progress bar, we have to do this
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');

    return `${mm}:${ss}`;
}

export function formatHMS(seconds){ // parameter getting passed here returns it in an HMS format, meaning if totalTimeWorked is 90, it returns as 0h 1m 30s
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hrs}h ${mins}m ${secs}s`;
}

export function parseTimeInput(str){ // code from copilot
    const regex = /(\d+)\s*(h|m|s)/gi;
    let totalSeconds = 0;
    let match;

    while ((match = regex.exec(str)) !== null){
        const value = Number(match[1]);
        const unit = match[2].toLowerCase();

        if (unit === 'h') totalSeconds += value * 3600;
        if (unit === 'm') totalSeconds += value * 60;
        if (unit === 's') totalSeconds += value;
    }

    return totalSeconds;
}

export function formatTimeInput(seconds){ // code from copilot
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    let content = "";
    if (h > 0) content += `${h}h`;
    if (m > 0) content += `${m}m`;
    if (s > 0) content += `${s}s`;

    return content || "0s";
}