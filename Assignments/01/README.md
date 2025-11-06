# Assignment 01 

## Brief 

Starting from the concept of a pinboard, implement a web page that:

- is responsive (properly layout for smartphone, tablet, and desktop)
- allows the user to add and remove elements
- allows the user to customize elements (i.e. colors, size)
- allows the switch between two views (at least)

![first screenshot](doc/assignment01_1.png)
![second screenshot](doc/assignment01_2.png)
![third screenshot](doc/assignment01_3.png)
![fourth screenshot](doc/assignment01_4.png)

## Project Description

Track and organize your yoga poses with custom color dots for difficulty, type, or style. View your progress, create a color legend, and switch between Flow and Grid views to visualize your journey. Keep practicing to grow your collection!

## List of functions

1. addPose(name, color)

Description: Creates and adds a new pose to the list with a small color dot and a remove button.

Returns: Nothing (updates the DOM and statistics).

2. removePose(element)

Arguments: element → the <li> element to remove.

Description: Deletes the selected pose and updates statistics.

3. updateStats()

Description: Updates total pose count, most-used color, and progress bar.

Returns: Nothing (updates displayed data).

4. switchView(mode)

Arguments: mode → "list" or "card".

Description: Toggles between Flow view and Grid view layouts.

Returns: Nothing (changes CSS classes).

5. clearAllPoses()

Description: Displays a confirmation modal and, if confirmed, removes all poses from the list.

6. addLegend(color, label)

Arguments: color, label.

Description: Adds a new color legend entry with a colored square and a description.

Returns: Nothing (updates the Color Legend section).

7. removeLegendItem(element)

Arguments: element → the legend item to remove.

Description: Removes a color entry from the Color Legend.