const colors = ["red", "blue", "green", "purple", "yellow"] as const;

export function getRandomIconColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}
