# Polarus Companion App Pull-Request Template

**Please use this format to fill out the description of your PR as you make progress.** 
Keep in mind that you can (and should) edit and update this as you work on this PR to keep it updated.

## PR Checklist
- [ ] 1. PR title (above) matches the name of a task on Notion
- [ ] 2. Task on notion has PR # set to the number of this PR
- [ ] 3. The base branch of this PR is correct
- [ ] 4. The status of the PR is set to 'Draft' if applicable
- [ ] 5. The PR includes an appropriate status label.

# BEGIN PR DESCRIPTION 
> Delete everything above and including this line before creating your PR - also delete any instructions below.

## Changes
> Describe the changes (or additions) made by this PR at a high level.

## Requirements
> Do the changes introduce any requirements outside of the code? For example, of a new dependency is added and requires `yarn install`, list that here. If not, put 'N/A'.

Requires: ?
OR
N/A

## PR Dependencies
> List the PR #s of all branches on which this PR depends, including the specified base-branch, prepending them with "Depends on:" (e.g. Depends on: #77).

Depends on: 

## Merged Branches and Other Dependencies
> If you merged another branch into the one used in this PR, it should be referenced here. Also specify (and explain) any non-merge or soft dependencies that might exist.

Merged branch(es):
Other dependencies:

## Subtasks / Progress
> (Optional) A checklist of sub-tasks to be completed in this PR. The number of incomplete sub-tasks should be greater than 0 if and only if the status of the PR is set to 'Draft'.

- [ ] Subtask 1
- [ ] Subtask 2

## Preview
> Include any content which demonstrates new functionality, such as screenshots or video captures (for frontend features), links to staging, results of benchmarks.

## Testing
> How the changes are tested, if applicable. Should be 'None', or a non-empty subset of { 'Manual', 'Automated' }. For instance, if the code has unit-tests in Jest but requires some manual testing for integration, you might put 'Automated, Manual'. List any automated tests.

- [ ] Manual 
- [ ] Automated

List of added tests:
- xyz
