import EnumHelper from 'common/utils/enumHelper';

export enum PromptsCategoryStyles {
    Anxiety = 'anxiety',
    Anger = 'anger',
    Depression = 'depression',
    Neutral = 'neutral',
    Any = 'any',
}

export type PromptsCategory<T extends number> = {
    id: T,
    name: string,
    style: PromptsCategoryStyles,
};

export namespace AppPromptsCategories {

    export enum Types {
        Any = 0,
        Anxiety = 10,
        Anger = 12,
        Depression = 14,
        Neutral = 16,
    }

    export namespace Types {
        export const Helper = new EnumHelper<Types>(Types);
        export const Strings =  {
            get [Types.Anxiety]() { return 'Anxiety'; },
            get [Types.Anger]() { return 'Anger'; },
            get [Types.Depression]() { return 'Depression'; },
            get [Types.Neutral]() { return 'Neutral'; },
            get [Types.Any]() { return 'Any'; },
        };
    }

    export const Categories: PromptsCategory<Types>[] = [
        { id: Types.Any, name: 'Any', style: PromptsCategoryStyles.Any },
        { id: Types.Anxiety, name: 'Anxiety', style: PromptsCategoryStyles.Anxiety },
        { id: Types.Anger, name: 'Anger', style: PromptsCategoryStyles.Anger },
        { id: Types.Depression, name: 'Depression', style: PromptsCategoryStyles.Depression },
        { id: Types.Neutral, name: 'Neutral', style: PromptsCategoryStyles.Neutral },
    ];
}
