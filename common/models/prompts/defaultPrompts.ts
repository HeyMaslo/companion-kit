import { createLazy } from 'common/utils/lazy.light';
import { InterventionTip, TipsLabels } from 'common/models';
import { AppPromptsCategories } from './PromptCategories';
import { PromptType } from './Prompt';
import { GoalType } from './goals/GoalType';

const DefaultPrompts = createLazy<PromptType[]>(() => [
    <PromptType>{ id: 'default_1', categoryId: AppPromptsCategories.Types.Anger, text: 'Is there anything that feels frustrating right now?', default: true },
    <PromptType>{ id: 'default_2', categoryId: AppPromptsCategories.Types.Anger, text: 'How would you handle it if you lost your temper?', default: true },
    <PromptType>{ id: 'default_3', categoryId: AppPromptsCategories.Types.Depression, text: 'Are you looking forward to anything?', default: true },
    <PromptType>{ id: 'default_4', categoryId: AppPromptsCategories.Types.Depression, text: 'Can you think of ways to make yourself feel better?', default: true },
    <PromptType>{ id: 'default_5', categoryId: AppPromptsCategories.Types.Anxiety, text: 'Do you feel confident you can handle things in your life?', default: true },
    <PromptType>{ id: 'default_6', categoryId: AppPromptsCategories.Types.Anxiety, text: 'Is anything making you feel nervous right now?', default: true },
    <PromptType>{ id: 'default_7', categoryId: AppPromptsCategories.Types.Neutral, text: 'How was school today?', default: true },
    <PromptType>{ id: 'default_8', categoryId: AppPromptsCategories.Types.Neutral, text: 'Are you making progress towards your goals?', default: true },
]);

const EmergencyPrompts = createLazy<PromptType[]>(() => [
    <PromptType>{ id: 'emergency_1', categoryId: AppPromptsCategories.Types.Neutral, text: 'How is your day going?' },
    <PromptType>{ id: 'emergency_2', categoryId: AppPromptsCategories.Types.Neutral, text: 'How have you been feeling the last few days?' },
    <PromptType>{ id: 'emergency_3', categoryId: AppPromptsCategories.Types.Neutral, text: 'Did anything interesting happen to you lately?' },
    <PromptType>{ id: 'emergency_4', categoryId: AppPromptsCategories.Types.Neutral, text: 'Are things going well for you?' },
    <PromptType>{ id: 'emergency_5', categoryId: AppPromptsCategories.Types.Neutral, text: 'Talk about something that is important to you.' },
]);

const DefaultTips = createLazy<InterventionTip[]>(() => [
    <InterventionTip>{ id: 'default_1', labels: [TipsLabels.Tired], text: 'Can you take a short break and just focus on relaxing and making yourself feel better, even if it\'s just for a few minutes?', default: true },
    <InterventionTip>{ id: 'default_2', labels: [TipsLabels.Lonely], text: 'Everyone feels lonely some times. It\'s normal and it\'s OK to feel that way. Can you think of an activity that you like to do by yourself?', default: true },
    <InterventionTip>{ id: 'default_3', labels: [TipsLabels.Sad], text: 'Everyone has a bad day sometimes. You can try again tomorrow.', default: true },
    <InterventionTip>{ id: 'default_4', labels: [TipsLabels.Insulted], text: 'Filter out the emotion from what someone is saying. Ask yourself, is there any positive reason someone might want a change in your behavior?', default: true },
    <InterventionTip>{ id: 'default_5', labels: [TipsLabels.Doubtful], text: 'Focus on something small that is right in front of you.  You don\'t have to succeed at everything.  Even small goals and small wins can feel good.', default: true },
    <InterventionTip>{ id: 'default_6', labels: [TipsLabels.Scared], text: 'Have you ever been in scary situation before but got through it?  Remember that you are strong and you can handle what life gives you.', default: true },
    <InterventionTip>{ id: 'default_7', labels: [TipsLabels.DontCare], text: 'If you don\'t care about something because you are afraid you might fail at it can you think of some things that might improve your chances.', default: true },
    <InterventionTip>{ id: 'default_8', labels: [TipsLabels.Pressured], text: 'If you feel pressured, pause for a moment and think about what you really want, what\'s really important to you.', default: true },
    <InterventionTip>{ id: 'default_9', labels: [TipsLabels.Trapped], text: 'Imagine how you would like your life to be then think of how you can get to that place.  It might take a while but the first step is to come up with a plan.', default: true },
    <InterventionTip>{ id: 'default_10', labels: [TipsLabels.Resentful], text: 'Imagine seeing the situation in the rear view mirror of a car. It\'s OK to look at it, but don\'t focus on it. What\'s important is in front of you.', default: true },
    <InterventionTip>{ id: 'default_11', labels: [TipsLabels.Provoked], text: 'Imagine that you have an invisible shield. In your mind, hold it up when someone is attacking you.', default: true },
    <InterventionTip>{ id: 'default_12', labels: [TipsLabels.Violent], text: 'Pause for a moment. Retreat from the situation. Rethink how you would like this situation to turn out. Respond in a way that helps you get the outcome you want.', default: true },
    <InterventionTip>{ id: 'default_13', labels: [TipsLabels.Unappreciated], text: 'Remember a time when you did something well. What are the things you do that make you feel proud?', default: true },
    <InterventionTip>{ id: 'default_14', labels: [TipsLabels.Overwhelmed, TipsLabels.Stressed, TipsLabels.Worried], text: 'Remember that no matter how bad things are right now, whatever you are experiencing will pass. Can you think of a time in the past when you were really worried about something but you got through it?', default: true },
    <InterventionTip>{ id: 'default_15', labels: [TipsLabels.Helpless], text: 'Sometimes a problem can seem too big.  Can you break a big problem into smaller problems and focus on something you can control?', default: true },
    <InterventionTip>{ id: 'default_16', labels: [TipsLabels.Nervous], text: 'Sometimes it\'s a struggle to do something new, but it\'s also how we learn. You will get better the more you do something.', default: true },
    <InterventionTip>{ id: 'default_17', labels: [TipsLabels.Ignored], text: 'Sometimes people are so involved with themselves they don\'t notice us. It doesn\'t feel good but remind yourself of the people that don\'t make you feel that way.', default: true },
    <InterventionTip>{ id: 'default_18', labels: [TipsLabels.Invisible], text: 'There are things you do well. You can emphasize those strengths to get more of what you want from life.', default: true },
    <InterventionTip>{ id: 'default_19', labels: [TipsLabels.InTrouble, TipsLabels.Guilty], text: 'We often think things are worse than they are.  Can you think of ways to make the situation better?', default: true },
    <InterventionTip>{ id: 'default_20', labels: [TipsLabels.Restless], text: 'When you feel restless it can help to try to slow down.  Try taking three slow breaths then imagine doing something peaceful that you enjoy.', default: true },
    <InterventionTip>{ id: 'default_21', labels: [TipsLabels.Ashamed], text: 'You are judging yourself harder than others do.  There\'s more to you than one thing.', default: true },
    <InterventionTip>{ id: 'default_22', labels: [TipsLabels.Angry], text: 'Spend a few minutes writing down why you are mad on a piece of paper, then tear it up and throw it away.  It might help you let go of the bad feelings.', default: true },
    <InterventionTip>{ id: 'default_23', labels: [TipsLabels.Annoyed], text: 'Sometimes when something or someone is annoying the best thing to do is step away from the situation for a while.', default: true },
    <InterventionTip>{ id: 'default_24', labels: [TipsLabels.Betrayed], text: 'Sometimes people let us down and we can\'t control that.  Remind yourself that you can control how you respond.', default: true },
    <InterventionTip>{ id: 'default_25', labels: [TipsLabels.Disappointed], text: 'Sometimes things don\'t work out the way we want.  Remind yourself that no matter how hard it is, there\'s always a next time.', default: true },
    <InterventionTip>{ id: 'default_26', labels: [TipsLabels.Embarrassed], text: 'Everyone makes mistakes.  Just remember that once this feeling passes it won\'t be so bad.  You may even laugh at it one day.', default: true },
]);

const DefaultGoals = createLazy<GoalType[]>(() => [
    // { id: 'default_1', default: true, text: 'Text or call a friend each day for a week' },
    // { id: 'default_2', default: true, text: 'Make an appointment for your mom over the phone' },
    // { id: 'default_3', default: true, text: 'Place an order for pizza over the phone' },
    // { id: 'default_4', default: true, text: 'Set up a Zoom call with 2 or more friends' },
    // { id: 'default_5', default: true, text: 'Call the City Parks Dept and ask if basketball courts are now open' },
]);

export function getDefaultPrompts() {
    return DefaultPrompts.value;
}

export function getEmergencyPrompts() {
    return EmergencyPrompts.value;
}

export function getDefaultTips() {
    return DefaultTips.value;
}

export function getDefaultGoals() {
    return DefaultGoals.value;
}
