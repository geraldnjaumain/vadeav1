/**
 * DiceBear Avatar Utility
 * Generates consistent, deterministic avatars using DiceBear API
 * https://www.dicebear.com/
 */

type AvatarStyle =
    | "adventurer"
    | "avataaars"
    | "bottts"
    | "fun-emoji"
    | "icons"
    | "initials"
    | "lorelei"
    | "micah"
    | "notionists"
    | "open-peeps"
    | "personas"
    | "pixel-art"
    | "thumbs";

interface AvatarOptions {
    /** Unique seed for generating consistent avatars (e.g., user ID or email) */
    seed: string;
    /** Avatar style to use */
    style?: AvatarStyle;
    /** Size in pixels */
    size?: number;
    /** Background color (hex without #) */
    backgroundColor?: string;
    /** Radius for rounded corners (0-50) */
    radius?: number;
}

/**
 * Generate a DiceBear avatar URL
 * @example
 * const avatarUrl = getAvatarUrl({ seed: "john@example.com" });
 * <img src={avatarUrl} alt="Avatar" />
 */
export function getAvatarUrl({
    seed,
    style = "initials",
    size = 80,
    backgroundColor,
    radius = 50,
}: AvatarOptions): string {
    const baseUrl = `https://api.dicebear.com/7.x/${style}/svg`;

    const params = new URLSearchParams({
        seed,
        size: size.toString(),
        radius: radius.toString(),
    });

    if (backgroundColor) {
        params.append("backgroundColor", backgroundColor);
    }

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Get initials-based avatar URL (recommended for user profiles)
 */
export function getInitialsAvatar(name: string, size = 80): string {
    return getAvatarUrl({
        seed: name,
        style: "initials",
        size,
        backgroundColor: "3b82f6", // Primary blue without #
        radius: 50,
    });
}

/**
 * Get a fun illustrated avatar (good for students)
 */
export function getFunAvatar(seed: string, size = 80): string {
    return getAvatarUrl({
        seed,
        style: "fun-emoji",
        size,
        radius: 50,
    });
}

/**
 * Get a professional avatar (good for teachers)
 */
export function getProfessionalAvatar(seed: string, size = 80): string {
    return getAvatarUrl({
        seed,
        style: "notionists",
        size,
        radius: 50,
    });
}
