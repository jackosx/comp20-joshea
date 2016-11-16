README.md

Jack O'Shea
2048 with High Scores

The project is a modified 2048 game. Everything is hosted on a Heroku server at the URL: 
    http://comp20-joshea-2048.herokuapp.com


The default GET request returns the scoreboard page


The main improvement is the global high score board. Playing the game at:
    http://comp20-joshea-2048.herokuapp.com/play
will prompt you for your username at the end of the game, then post your score the the score board using that username.


JSON with the results of all of a user's past games can be retrieved with a GET request to the URL:
    http://comp20-joshea-2048.herokuapp.com/scores.json?username=USERNAME


A POST route also exists for other game clients wishing to submit their scores at the URL:
    http://comp20-joshea-2048.herokuapp.com/submit.json

It should include values for the following keys:
    score
    grid
    username

Completion time: 6hrs? Not sure I spent a while trying to make the prompt appear after the Game Over message