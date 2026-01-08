# After-Effects-Slideshow-Grid
An After Effects script that takes a folder of photos and creates a 3D grid, complete with camera movement from photo to photo. Useful for creating dynamic slideshows for special events, weddings, and more.

<video src='demo.mp4'></video>

<video src='grid.mp4'></video>

This project was inspired from [this tutorial](https://www.youtube.com/watch?v=l5-tc_aUOSY), but automated with a script, turning what would take hours to make into seconds.

# Features
## Perfect loop
Automatically creates a perfect loop by bringing the camera back to the starting position at the end of the animation.
## Customize the amount of time at each photo
Control how long the camera lingers on each photo before moving to the next one.

Control this by ending the filename with `T#`, where `#` is the number of seconds to linger. For example, `IMG_1234T8.jpg` will make the camera linger for 8 seconds on that photo.
## Control variables
You can customize the behavior of the script by adjusting variables at the top of the `script.js` file.

# Control Variables
## `RANDOMIZE_ORDER`
Set to `true` to randomize the order in which the photos will be inserted into the photo grid. Default is `false`.
## `RANDOMIZE_ORDER_IN_PLANE`
Set to `true` so that when a new plane is created, the location of the photos within that plane are randomized. This enables nicer camera movement from photo to photo instead of a predictable movement across the plane. Default is `true`.
## `REVERSE_ORDER`
Set to `true` to reverse the order in which the photos will be inserted into the photo grid. Default is `false`.
## `X_SPACING`
Set the spacing between photos on the X-axis. Default is `4000`.
Note: This is from the center of one photo to the center of the next photo.
## `Y_SPACING`
Set the spacing between photos on the Y-axis. Default is `4000`.
Note: This is from the center of one photo to the center of the next photo.
## `Z_SPACING`
Set the spacing between photos on the Z-axis. Default is `7500`.
## `PHOTOS_PER_ROW`
Set the number of photos per row in the grid. Default is `5`.
## `PHOTOS_PER_COLUMN`
Set the number of photos per column in the grid. Default is `4`.
## `XY_OFFSET`
Set the random offset applied to each photo on the X and Y axes. Default is `0`.
## `Z_OFFSET`
Set the random offset applied to each photo on the Z axis. Default is `1000`.
Note: Be careful when adjusting this value, as too high of a value may cause photos to overlap in 3D space or block the camera's view of other photos.
## `TRANSITION_TIME`
Set the time (in seconds) it takes for the camera to move from one photo to the next. Default is `2`.
## `HOLD_TIME`
Set the time (in seconds) the camera holds on each photo before transitioning to the next one. Default is `5`.
## `CREATE_CUBE`
Duplicates the photo grid and arranges the duplicates in a cube formation around the original grid to give the appearance of more photos. Default is `false`.
NOTE: This will significantly increase the number of layers in your composition and may impact performance by a factor of 6x. Use with caution!

# Usage
1. Open After Effects and create a new project.
2. Create a folder called "Photos" in your project panel and import all the photos you want to use in your slideshow into that folder.
3. Go to `File > Scripts > Run Script File...` and select the `script.js` file.
4. Export the generated `Main` composition as a video file.