export interface GameData {
    player_name: string;
    score: number | null;
    level: number | null;
    unlocked_areas: string[] | null;
    completed_prompts: string[] | null;
    total_entries: number | null;
}
