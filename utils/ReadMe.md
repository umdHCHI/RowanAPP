What is this utils folder for? 

Great question! These are split up utilities used within the project of The Archive to allow for reusability. The outline of this folder structure is as follows: 



- character-assets.ts = mapping to the character assets. This should just be the main file where each element is for customization. 

- character-avatar-config.ts = Using character-assets this converts backend data shape to grab each aspect of the character to determine the player avatar. 

- format-quote.ts = I have this here to help format some of the story data in this application. I needed this early on and especially during the early versions of the story. 

- profile-mapper.ts =expierence for player 

- story-constants.ts = data that is unchanable for the story in this project 

- story-helpers.ts = This has a bunch of story helpers and can probably be trimmed down/refactored. Reward functions and story progression related items are in here. 

- story-navigation = Navigate to story of choice

- story-speed = setting the speed of the story 

- useHaptics = Haptic integration allowing light, medium, and heavy impact. 


- usePageFlipsounds = this is for the pageflipsound that is to be added to all buttons. 

- useStoryMusic = This connects the music files to the corresponding story ID. Change Volume here as needed 

- vantage-constants = all static data for the mini game. Change as needed for difficultly adjustments/speed anything else. 

- vantage-helper - the thought patterns of the mini-game. Can expand or edit here. Power up images are also here. 



Fine for first pass through 

Refactor plan 

[] Types in one section (put into types folder)
[] split up story-helper 
[] Remove any attribute references. Only lumens apply
[] Add index.ts to organize imports into one file 