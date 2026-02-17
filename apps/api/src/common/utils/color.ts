const colors = ["red.png", "blue.png", "green.png", "purple.png", "yellow.png"] as const;

export function getRandomIconColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}
