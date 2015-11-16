(function blackjack() {

	//DOM caching 
	var addPlayerBtn = document.getElementById('addPlayer'),
		startGameBtn = document.getElementById('startGame'),
		passBtn = document.getElementById('pass'),
		hitBtn = document.getElementById('hit'),
		startContainer = document.querySelector('.start-container'),
		gameContainer = document.querySelector('.game-container'),
		dealersHand = document.querySelector('.dealers-hand'),
		playersHand = document.querySelector('.players-hand'),
		playerHandValue = document.querySelector('.hand-value'),
		endResult = document.querySelector('.end-result'),
		allPlayers = document.querySelector('.all-players'),
		playerBust = document.querySelector('.player-bust'),
		playerName = document.querySelector('.player-name'),
		playBtn = document.querySelector('.play-button-container'),
		playersCardHand = document.querySelector('.players-card-hand');
	
	//Events
	addPlayerBtn.addEventListener('click', addPlayers, false);
	startGameBtn.addEventListener('click', startGame, false);
	passBtn.addEventListener('click', pass, false);
	hitBtn.addEventListener('click', hit, false);

	var playerAmount = 0,
	    nextCard = 0,
	    currentPlayerId = 0,
	    playingPlayer = 1,
	    aceCounter = 0,
	    players = [],
	    dealers = [];

	//Check if players exists
	if(playerAmount <= 0 ) {
		startGameBtn.disabled = true;
		startGameBtn.classList.add('inactive');
	}
	/*
	    |-----------------------------------------------------
	    | Deck functionality
	    |-----------------------------------------------------
	    |
	    | Create cards, add to new deck, shuffle deck
	    | 
	*/

	//Card structure
	function card(value, name, suit) {
	    this.value = value;
	    this.name = name;
	    this.suit = suit;
	}

	//Creating deck
	function deck() {
	    this.names = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	    this.value = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
	    this.suits = ['&hearts;', '&diams;', '&spades;', '&clubs;'];
	    var cards = [];

	    for(var s = 0; s < this.suits.length; s++) {
	        for(var j = 0; j < this.names.length; j++) {
	            cards.push(new card(this.value[j], this.names[j], this.suits[s]));
	        }
	    }
	    return shuffle(cards);
	}

	//Shuffle deck
	function shuffle(shuffleDeck) {
	    var m = shuffleDeck.length,
	        t, i;

	    while (m) {
	        i = Math.floor(Math.random() * m--);
	        t = shuffleDeck[m];
	        shuffleDeck[m] = shuffleDeck[i];
	        shuffleDeck[i] = t;
	    }

	    return shuffleDeck;
	}
	//Create new deck
	var shuffledDeck = new deck();

	/*
	    |-----------------------------------------------------
	    | Cardholder functionality
	    |-----------------------------------------------------
	    |
	    | Create players, add cards, add value
	    | 
	*/

	//Player structure
	function player(playerId) {
	    this.playerId = playerId;
	    this.cardValue = 0;
	    this.card = [];
	    this.winnings = "";
	    this.aceAmount = 0;
	}

	//Dealer structure
	function dealer() {
	    this.cardValue = 0;
	    this.card = [];
	    this.aceAmount = 0;
	}

	//Create amount of players that will be play, max 5
	function addPlayers() {
	    playerAmount++;
	    startGameBtn.disabled = false;
	    startGameBtn.classList.remove('inactive');

	    if (playerAmount >= 5) {
	       addPlayerBtn.classList.add('inactive');
	       addPlayerBtn.disabled = true;
	    }

	    allPlayers.textContent = playerAmount;
	}

	//Create new players
	function createPlayer() {
	    for (var p = 0; p < playerAmount; p++) {
	        players.push(new player(this.playerId = p));
	    }
	}

	//Create new dealer
	function createDealer() {
	    dealers.push(new dealer());
	}

	/*
	    |-----------------------------------------------------
	    | Start game
	    |-----------------------------------------------------
	    |
	    | Give players/dealer cards
	    | Display current player
	    |
	*/

	//Give hand
	function hand(status) {
		var cardDrawn = shuffledDeck[nextCard];
		status.card.push(cardDrawn);
	}

	//Calculate hand value
	function handValue(hand) {
		
		for (var handAmount = 0; handAmount < hand.length; handAmount++) {
			hand[handAmount].cardValue = 0;
			
			for (var cardAmount = 0; cardAmount < hand[handAmount].card.length; cardAmount++){
				hand[handAmount].cardValue += hand[handAmount].card[cardAmount].value;

				if(hand[handAmount].card[cardAmount].value == 11  && hand[handAmount].cardValue > 21){
					aceCounter++;
					hand[handAmount].aceAmount = aceCounter;
		
					hand[handAmount].cardValue -= 10;
				}
			}
		}
	}

	//Start game
	function startGame() {
	   	startContainer.classList.add('hide-div');
     	gameContainer.classList.remove('hide-div');
    
		createPlayer();
	    createDealer();

	    //Makes sure that every player gets two cards in the start of the game
		var j = 0;
		for (nextCard; nextCard < (playerAmount * 2); nextCard++) {
			var cardHolder = players[j];
			hand(cardHolder);
			j++;

			if (j == playerAmount) {
	            j = 0;
	        }
		}

		hand(dealers[0]);
		handValue(players);
		handValue(dealers);
		currentPlayersView();
	}

	/*
		|-----------------------------------------------------
	    | Player options
	    |-----------------------------------------------------
	    |
	    | Pass a turn
	    | Draw a new card
	    |
	*/    

	//Player pass turn
	function pass() {
		changeCardView();
		currentPlayerId++;
		playingPlayer++;

		removeBust();
		currentPlayersView();
		dealersTurn();
	}

	//Player takes another card
	function hit() {
		changeCardView();
		hand(players[currentPlayerId]);
		handValue(players);
		currentPlayersView();
		bust();
		dealersTurn();

		nextCard++;

	}

	/*
		|-----------------------------------------------------
	    | Outcomes
	    |-----------------------------------------------------
	    |
	    | Player gets over 21
	    | Dealer draw cards 
	    | End alternatives
	    |
	*/    

	function bust() {
		if(players[currentPlayerId].cardValue > 21) {
			hitBtn.disabled = true;
			changeCardView();
			currentPlayersView();

			playerBust.classList.remove('out');
		}
	}

	function dealersTurn() {
		nextCard++;
		if(currentPlayerId == players.length) {
			do {
				hand(dealers[0]);
				handValue(dealers);
				nextCard++;
			} 
			while(dealers[0].cardValue < 17);

			endAlt();
			endResultOutput();
		}
	}

	function endAlt() {
		for(var allGames = 0; allGames < players.length; allGames++) {
		
			if(players[allGames].cardValue > 21) {
				players[allGames].winnings = 'You got bust';
			}
			else if(dealers[0].cardValue > 21) {
				players[allGames].winnings = 'You won, dealer got bust';
			}
			else if(players[allGames].cardValue == 21 && players[allGames].card.length == 2 && dealers[0].cardValue != 21){
				players[allGames].winnings = 'Black Jack!';
			}
			else if(dealers[0].cardValue < players[allGames].cardValue){
				players[allGames].winnings = 'You won on heigher card';
			}
			else if(dealers[0].cardValue > players[allGames].cardValue){
				players[allGames].winnings = 'Dealer won on heigher card';
			}
			else if(dealers[0].cardValue >= 20 && players[allGames].cardValue >= 20 && dealers[0].cardValue <= 21){
				players[allGames].winnings = 'You tied';
			}
			else if(dealers[0].cardValue == players[allGames].cardValue){
				players[allGames].winnings = 'You tied, but dealer won';
			}
		}
	}

	/*
	    |-----------------------------------------------------
	    | Display
	    |-----------------------------------------------------
	    |
	    | Display current player
	    | Display cards
	    | Display end results
	    | 
	*/

	// Display current players info and cards
	function currentPlayersView() {
		if(currentPlayerId >= players.length) {
			playersHand.classList.add('hide-div');
		}else{
			playerName.textContent = playingPlayer;
			playerHandValue.textContent = players[currentPlayerId].cardValue;
			dealersHand.textContent = dealers[0].cardValue;

			if(currentPlayerId < players.length) {
				for(var j = 0; j < players[currentPlayerId].card.length; j++){
					var drawnCard = document.createElement('div');
					drawnCard.className = 'card';
					
					drawnCard.innerHTML = '<p>' + players[currentPlayerId].card[j].name + '</p>' + 
					'<span>' + players[currentPlayerId].card[j].suit + '</span>';

					playersCardHand.appendChild(drawnCard);
				}
	
			}
		}
	}
	//Remove display cards
	function changeCardView() {
		while (playersCardHand.hasChildNodes()) {
			playersCardHand.removeChild(playersCardHand.firstChild);
		}
	}

	//Remove bust button
	function removeBust() {
		playerBust.classList.add('out');
		hitBtn.disabled = false;
	}

	//Display all the players end result and status
	function endResultOutput() {
		var displayName = 1;
		for (var endRes = 0; endRes < players.length; endRes++) {
			var playersEndRes = document.createElement('div');
			playersEndRes.className = 'player-result';

			playersEndRes.innerHTML = '<h2>Player ' + displayName + '</h2>' + 
			'<p>Card value: ' + players[endRes].cardValue + '</p>' + 
			'<p>End result: ' + players[endRes].winnings + '</p>';

			endResult.appendChild(playersEndRes);
			displayName++;
		}
		dealersHand.textContent = dealers[0].cardValue;
		playBtn.classList.add('hide-div');
	}


})();