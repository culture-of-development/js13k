## Learned

Stuff we actually did.

- visual editors for content is awesome
  - massive productivity boost
- player controller design
  - this was important
  - where to put the controller
  - how to override the controller when things happen
- interaction system
  - lots of iteration
  - not clear which side the interaction should happen from
  - interaction makes the game fun
- inventory system
  - harder than it seems
  - really bad rendering issues with our method
  - did not get to stacking of items, eg data or keys
- audio is super expensive from a size standpoint
  - really fun to make the sounds though
  - they add an incredible amount of depth to the game
- built a main screen but did not do anything with it
- the story was half baked
- dialog view turned out to be a lot of fun
  - provided a lot of value, how to play
  - forced us to update the controller for the input
- spend time playing your game and you will learn whats working and whats not
  - was not clear where you could move
  - sounds for specific blocking interactions
  - not walking through walls
  - lots more
- the lighting was really hard
  - forced us to redesign the walls
  - forced us to consider interactions from lots of sources
  - never really found a good lighting level, for anything
  - the worst implementation of all the features
  - still super important because it was one of the primary challenges
- how to get raw image data in a browser from an image file
  - dealing with different compression formats, etc




## Future Work

This is not related to this game per say, but things I now want to try as a result of having had this experience.

- unity has an idea of game objects as the overarching structure
  - this is sort of the model that fell out of items in my design and was very helpful in making things just kinda work
  - explore more structures and find pros and cons of each
- use a better rendering engine than the dom
  - consider 3d graphics
  - try orthographic projection window and only render in the real dom what might actually be on screen, keep everything else out of dom
- ad hoc layers caused a lot of pain, do some more planning there
- store everything in a giant js model, dont use the dom as the model
  - makes it easier to switch rendering engines, etc
- try alterative interaction styles
  - specifically figure out which direction the interaction should happen
- learn better techniques for shrinking audio
- figure out how to reset the game
- make better use of the graphical editor