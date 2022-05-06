var turnsLeft = 20;

var wildlife = ['bear', 'fox', 'elk', 'hawk', 'salmon'];

var tokenNums = {
	bear: 20,
	salmon: 20,
	hawk: 20,
	elk: 20,
	fox: 20
};

var allTiles = [];
var allTokens = [];
var initialTiles = [];
var initialTokens = [];
var displayedTokens = [];
var mapData = [];

var mapRowsColumnsIndexes = {
	rows: {},
	columns: {}
};


// how big the generated map is
// up-down = 0-39 limits
// left-right = 0-39 limits
var mapLimits = {
	up: 10,
	down: 30,
	left: 10,
	right: 30
}

var mapMoveAmount = {
	'tilePos': {
		'top': 0,
		'left': 0
	},
	'view':{
		'desktop': {
			'incs': {
				'vertical': 85,
				'horizontal': 100			
			},
			'unit': 'px'
		},
		'tablet': {
			'incs': {
				'vertical': 8,
				'horizontal': 9.25			
			},
			'unit': 'vw'
		},
		'mobile': {
			'incs': {
				'vertical': 14.1,
				'horizontal': 16.35			
			},
			'unit': 'vw'
		}
	}
}

var mapRowRange = mapLimits.down - mapLimits.up; // 22 rows
var mapColumnRange = mapLimits.right - mapLimits.left; // 22 columns

var mapStats = {
	'centerRow': 20,
	'centerColumn': 20,
	'tileExtremes': {
		row: {
			top: 0,
			bottom: -1
		},
		column: {
			left: 1,
			right: 0
		}
	},
	'zoomStats': {
		'10': {
			xTilesVisible: 6,
			yTilesVisible: 4
		},
		'8': {
			xTilesVisible: 8,
			yTilesVisible: 6
		},
		'6': {
			xTilesVisible: 10,
			yTilesVisible: 6
		}
	},
	'directionStatus': {
		up: 'unlocked',
		down: 'unlocked',
		left: 'unlocked',
		right: 'unlocked'
	}
}


var currentChosenWildlife;

var natureCubesNum = 0;

var duplicatesClearedThisTurn = false;

var reverseTileTokenOrder = [3, 2, 1, 0];

var zoomLevel = 10;

// If device is touch capable, use touch as the trigger, otherwise the user is using a desktop computer so use click
var touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

var lockFunction = false;
var lockMap = false;

var rotateTileAllowed = false;

var currentView = 'desktop';

var rulesURL = 'https://drive.google.com/file/d/1fY8-__M2f0QSxvBi0P2oycG6F0l1yJiI/view';

$(window).resize(function() {
	checkScreenWidth();
});

function checkScreenWidth(){
	let changeOfView = false;
	var windowSize = $(window).width();

	if(windowSize <= 599) {
		if(currentView != 'mobile') {
			changeOfView = true;
			currentView = 'mobile';
		}
	} else if(windowSize <= 1205) {
		if(currentView != 'tablet') {
			changeOfView = true;
			currentView = 'tablet';
		}
	} else if(windowSize > 1205) {
		if(currentView != 'desktop') {
			changeOfView = true;
			currentView = 'desktop';
		}
	}

	if(changeOfView) {
		if(currentView != 'desktop') {
			$('#homepageButtonContainer .startCommenceButton').attr('id', 'commenceGame');
		} else {
			$('#homepageButtonContainer .startCommenceButton').attr('id', 'startGame');
		}
		
		if($('#mapContainer #mapHiddenOverlay').length) {
			setZoom(zoomLevel,document.getElementById("mapHiddenOverlay"));
		}

		updateMapPosition('horizontal');
		updateMapPosition('vertical');
		changeOfView = false;
	}

}

$(document).ready(function(){
	let subTitleText = $('#setupLayer.layer .subtitle.is-6').html();
	setupTiles(46); // Enter total number of tiles to be used in game as argument
	setupTokens();
	// setupScoringGoals(scoringGoalMode); //all or beginner
	updateNextTurn('setup');
	checkScreenWidth();

})

$(document).keydown(function(e){

	if(!lockMap) {
		lockMap = true;
		setTimeout(function(){
			lockMap = false;
		}, 220);

		if (e.which == 81 && rotateTileAllowed == true) { 
			rotateTileCounterClockwiseFunction();
			return false;
		} else if (e.which == 69 && rotateTileAllowed == true) { 
			rotateTileClockwiseFunction();
			return false;
		} else if (e.which == 37 || e.which == 65) { 
			if(mapStats.directionStatus.left == 'unlocked') {
				processMapMovement('left');
				return false;
			}
		 } else if (e.which == 38 || e.which == 87) { 
			if(mapStats.directionStatus.up == 'unlocked') {
				processMapMovement('up');
				return false;
			}
		 } else if (e.which == 39 || e.which == 68) { 
			if(mapStats.directionStatus.right == 'unlocked') {
				processMapMovement('right');
				return false;
			}
		 } else if (e.which == 40 || e.which == 83) { 
			if(mapStats.directionStatus.down == 'unlocked') {
				processMapMovement('down');
				return false;
			}
		 } else if (e.which == 9) { 
			e.preventDefault();
		 }
	}
    
});

function processMapMovement(thisDirection){

	if(thisDirection == 'up' || thisDirection == 'down') {	
		if(thisDirection == 'up') {
			mapMoveAmount.tilePos.top++;
		} else if(thisDirection == 'down') {	
			mapMoveAmount.tilePos.top--;	
		}
		checkIfMapLimitReached('vertical', mapMoveAmount.tilePos.top);
		updateMapPosition('vertical');
	}

	if(thisDirection == 'left' || thisDirection == 'right') {	
		if(thisDirection == 'left') {
			mapMoveAmount.tilePos.left++;
		} else if(thisDirection == 'right') {	
			mapMoveAmount.tilePos.left--;
		}

		checkIfMapLimitReached('horizontal', mapMoveAmount.tilePos.left);
		updateMapPosition('horizontal');
	}

	$('.' + thisDirection + 'Arrow').addClass('activeArrow');
	setTimeout(function(){
		$('.activeArrow').removeClass('activeArrow');
	}, 100);

}

function checkIfMapLimitReached(direction, newIncrementPosition){

	if(direction == 'horizontal') {

		mapStats.directionStatus.left = 'unlocked';
		mapStats.directionStatus.right = 'unlocked';
		$('.leftArrow').show();
		$('.rightArrow').show();

		let horizontalTileLimit = mapStats.zoomStats[zoomLevel].xTilesVisible;
		let horizontalTilesHalfwayAmount = Math.floor(horizontalTileLimit / 2);

		if(newIncrementPosition <= (mapStats.centerColumn - mapLimits.right) + (horizontalTilesHalfwayAmount) + 1) {
			mapStats.directionStatus.right = 'mapLimit-locked';
			$('.rightArrow').hide();
		} else if(newIncrementPosition <= (mapStats.tileExtremes.column.right - horizontalTilesHalfwayAmount)) {
			mapStats.directionStatus.right = 'tileLimit-locked'
			$('.rightArrow').hide();
		} else if(newIncrementPosition > (mapStats.centerColumn - mapLimits.left) - (horizontalTilesHalfwayAmount + 1)) {
			mapStats.directionStatus.left = 'mapLimit-locked'
			$('.leftArrow').hide();
		} else if((newIncrementPosition + 1) >= (mapStats.tileExtremes.column.left + horizontalTilesHalfwayAmount)) {
			mapStats.directionStatus.left = 'tileLimit-locked'
			$('.leftArrow').hide();
		}

	} else if(direction == 'vertical') {

		mapStats.directionStatus.up = 'unlocked';
		mapStats.directionStatus.down = 'unlocked';
		$('.upArrow').show();
		$('.downArrow').show();

		let verticalTileLimit = mapStats.zoomStats[zoomLevel].yTilesVisible;
		let verticalTilesHalfwayAmount = Math.floor(verticalTileLimit / 2);

		if(newIncrementPosition <= (mapStats.centerRow - mapLimits.down) + (verticalTilesHalfwayAmount) + 1) {
			mapStats.directionStatus.down = 'mapLimit-locked';
			$('.downArrow').hide();			
		} else if((newIncrementPosition - 1) <= (mapStats.tileExtremes.row.bottom - verticalTilesHalfwayAmount)) {
			mapStats.directionStatus.down = 'tileLimit-locked'
			$('.downArrow').hide();			
		} else if(newIncrementPosition > (mapStats.centerRow - mapLimits.up) - (verticalTilesHalfwayAmount + 1)) {
			mapStats.directionStatus.up = 'mapLimit-locked'
			$('.upArrow').hide();			
		} else if(newIncrementPosition >= (mapStats.tileExtremes.row.top + verticalTilesHalfwayAmount)) {
			mapStats.directionStatus.up = 'tileLimit-locked'
			$('.upArrow').hide();			
		}
	}
}

function updateMapPosition(moveDirection) {
	if(moveDirection == 'horizontal') {
		let newLeftPosNum = (mapMoveAmount.tilePos.left * mapMoveAmount.view[currentView].incs.horizontal) * (zoomLevel / 10);
		let newLeftPos = newLeftPosNum + mapMoveAmount.view[currentView].unit;
		$('#mapContainer #mapHiddenOverlay').css('left', newLeftPos);
	} else if(moveDirection == 'vertical') {
		let newTopPosNum = (mapMoveAmount.tilePos.top * mapMoveAmount.view[currentView].incs.vertical) * (zoomLevel / 10);
		let newTopPos = newTopPosNum + mapMoveAmount.view[currentView].unit;
		$('#mapContainer #mapHiddenOverlay').css('top', newTopPos);
	}
}

$(document).on(touchEvent,'#showWildlifeGoals',function(){

	if(currentView == 'mobile') {
		$('.hideWhenShowingGoalsMobile').hide();
	} else if(currentView == 'tablet') {
		$('.hideWhenShowingGoalsTablet').hide();
	}
	$('#gameLayer #goalLayerListContainer').show();
});

$(document).on(touchEvent,'#hideWildlifeGoals',function(){
	if(currentView == 'mobile') {
		$('.hideWhenShowingGoalsMobile').show();
	} else if(currentView == 'tablet') {
		$('.hideWhenShowingGoalsTablet').show();
	}
	$('#gameLayer #goalLayerListContainer').hide();
});


$(document).on(touchEvent,'#hideWildlifeGoals',function(){
	if(currentView == 'mobile') {
		$('.hideWhenShowingGoalsMobile').show();
	} else if(currentView == 'tablet') {
		$('.hideWhenShowingGoalsTablet').show();
	}
	$('#gameLayer #goalLayerListContainer').hide();
});


$(document).on(touchEvent,'#mobileGoalThumbnails .mobileThumbnail',function(){
	$('.mobileThumbnailActiveFrame').remove();
	$('.activeQuickViewGoal').removeClass('activeQuickViewGoal');
	$('.activeQuickViewGoalImg').removeClass('activeQuickViewGoalImg');

	let thisID = $(this).attr('id');
	let splitID = thisID.split('-');
	let currentWildlifeGoal = splitID[1];

	$(this).addClass('activeQuickViewGoal');
	$(this).append('<img class="mobileThumbnailActiveFrame" src="img/mobileScoringGoal-hover.png" alt="">');
	$(`#quickViewGoalImg-${currentWildlifeGoal}`).addClass('activeQuickViewGoalImg');

});


$(document).on(touchEvent,'.modal.is-active .modal-background.closableModalBackground',function(){
	$('.modal.is-active').removeClass('is-active');
});

$(document).on(touchEvent,'#frontPageGameInstructionsButton',function(){
	openInNewTab(rulesURL);
});

$(document).on(touchEvent,'#gameInstructionsButton',function(){
	openInNewTab(rulesURL);
});

$(document).on(touchEvent,'#mobileGameInstructionsButton',function(){
	openInNewTab(rulesURL);
});

$(document).on(touchEvent,'#replaceDuplicateTokens:not([disabled])',function(){

	// in case the player has already clicked a tile+token container to start the vanilla tile placement process - undo all of the active states before processing wwith the naturew cube process.
	deactivateChosenTile();

	$('#threeDuplicateTokensModal').addClass('is-active');
});

$(document).on(touchEvent,'#goalTilesContainer #goalList .goalScoring',function(){
	let thisWildlife = $(this).attr('id').split('-');
	$('#' + thisWildlife[0] + 'ScoringModal.modal').addClass('is-active');
});

$(document).on(touchEvent,'#goalsContainer .goalScoringThumbnailContainer',function(){
	let thisWildlife = $(this).attr('id').split('-');
	$('#' + thisWildlife[0] + 'ScoringModal.modal').addClass('is-active');
});

$(document).on(touchEvent,'.useNatureCube.button:not([disabled])',function(){
	// in case the player has already clicked a tile+token container to start the vanilla tile placement process - undo all of the active states before processing wwith the naturew cube process.
	deactivateChosenTile();

	$('#natureCubesModal').addClass('is-active');
});

$(document).on(touchEvent,'#confirmReplacingDuplicates',function(){
	$('.modal.is-active').removeClass('is-active');
	removeDuplicateTokens(3);
});

$(document).on(touchEvent,'#confirmReplacingFourDuplicates',function(){
	$('.modal.is-active').removeClass('is-active');
	removeDuplicateTokens(4);
});

$(document).on(touchEvent,'.closeModalTrigger',function(){
	$('.modal.is-active').removeClass('is-active');
});

$(document).on(touchEvent,'#startGame',function(){
	$('#keyboardKeysModal').addClass('is-active');
});

$(document).on(touchEvent,'#commenceGame',function(){
	$('body').addClass('gameView');
	$('.layer').hide();
	$('#gameLayer').show();
	// setupGoalTileThumbnails();
	setupInitialTokensAndTiles();
	initiateMap();
	// set to false since there are no Nature Tokens to use at the start of the game
	updateNatureCubesNum(false);
});

$(document).on(touchEvent,'#goalTilesContainer #goalList .goalScoring',function(){
	var targID = $(this).attr('id');
	var thisWildlife = targID.split('-');
	$('#' + thisWildlife[0] + 'ScoringModal').addClass('is-active');
});

$(document).on(touchEvent,'.zoomOptions .zoomOption.activeZoom',function(){

	if(!lockFunction) {

		lockFunction = true;

		setTimeout(function(){
			lockFunction = false;
		}, 220);

		let zoomInLimit = 10;
		let zoomOutLimit = 6;

		let zoomOption = $(this).attr('zoomType');

		if(zoomOption == 'zoomIn') {
			zoomLevel = zoomLevel + 2;

		} else if(zoomOption == 'zoomOut') {
			zoomLevel = zoomLevel - 2;
		}

		if(zoomLevel == zoomInLimit) {
			$('.zoomOptions .zoomIn').removeClass('activeZoom').addClass('inactiveZoom');
			$('.zoomOptions .zoomIn').attr('src', 'img/zoomIn-inactive.png')
		} else if(zoomLevel == zoomOutLimit) {
			$('.zoomOptions .zoomOut').attr('src', 'img/zoomOut-inactive.png')
			$('.zoomOptions .zoomOut').removeClass('activeZoom').addClass('inactiveZoom');
		} else {

			if(zoomLevel < zoomInLimit) {
				if($('.zoomOptions .zoomIn').hasClass('inactiveZoom')) {
					$('.zoomOptions .zoomIn').removeClass('inactiveZoom').addClass('activeZoom');
					$('.zoomOptions .zoomIn').attr('src', 'img/zoomIn.png')
				}
			}

			if(zoomLevel > zoomOutLimit) {
				if($('.zoomOptions .zoomOut').hasClass('inactiveZoom')) {
					$('.zoomOptions .zoomOut').removeClass('inactiveZoom').addClass('activeZoom');
					$('.zoomOptions .zoomOut').attr('src', 'img/zoomOut.png')
				}
			}

		}

		checkIfMapLimitReached('horizontal', mapMoveAmount.tilePos.left);
		checkIfMapLimitReached('vertical', mapMoveAmount.tilePos.top);

		setZoom(zoomLevel,document.getElementById("mapHiddenOverlay"));

	}
});

function setZoom(newZoom, el) {

	let transformOriginPercentages = '';

	if(currentView == 'desktop') {
		transformOriginPercentages = '9.4% 5.5%';
	} else if(currentView == 'tablet') {
		transformOriginPercentages = '13.4% 8%';
	} else if(currentView == 'mobile') {
		transformOriginPercentages = '21.1% 14%';
	}

	let zoomScale = Number(newZoom)/10;

	var p = ["webkit", "moz", "ms", "o"],
	s = "scale(" + zoomScale + ")"
	
	for (var i = 0; i < p.length; i++) {
		el.style[p[i] + "Transform"] = s;
		el.style[p[i] + "TransformOrigin"] = transformOriginPercentages;
	}

	el.style["transform"] = s;
	el.style["transformOrigin"] = transformOriginPercentages;

	updateMapPosition('vertical');
	updateMapPosition('horizontal');
}

$(document).on(touchEvent,'.mapNavigation .navArrow',function(){
	let thisDirection = $(this).attr('direction');
	processMapMovement(thisDirection);
});

$(document).on(touchEvent,'.tokenTileContainer:not(.chosenTokenTileContainer):not(.inactive):not(.potentialNatureCube):not(.natureCubeClearTokens)',function(){
	// Click on one of the four possible tile+token pairings to activate that container and show possible placemenets on the map

	// remove the previous active container class (if another container had been previously selected)
	$('.chosenTokenTileContainer').removeClass('chosenTokenTileContainer');

	// remove the yellow outline of the previously selected tile
	$('.selectedTileOutline').remove();

	// add the active class to newly chosen container
	$(this).addClass('chosenTokenTileContainer');

	// add the yellow outline to the tile that corresponds with the newly chosen container
	$(this).children('.tileContainer').append('<img class="selectedTileOutline" src="img/selectedTile.png" />');

	// run the function to generate the opaque yellow hexes on the map that show the player where the possible placements are
	showPossibleTilePlacements('normal');
});

$(document).on('mouseenter','.mapTileContainer.potentialPlacement',function(){
	// the .potentialPlacement class has been previously add to every hex container on the map to show the player where they can place the newly chosen tile on the map

	// target the currently hovered over tile
	var thisTile = $(this);

	// the tile+token pairing that had previously been clicked has the .chosenTokenTileContainer class assigned to it
	// targeting the .tileContainer child, a copy of all of the tile information is now created on the map hex that the user is currently hovering over
	$('.chosenTokenTileContainer .tileContainer').clone().appendTo(thisTile);

	// copying all of the tile contents also copies over the yellow border into the map - which we don't need as the user can easily tell what hex has just ben generated, so we can immediately delete this element from the newly generated tile html in the map
	$('.mapTileContainer.potentialPlacement .tileContainer .selectedTileOutline').remove();
});

$(document).on('mouseleave','.mapTileContainer.potentialPlacement',function(){
	// once the user leaves a map hex that is a potential placement, the tile that is currently being previewed is deleted
	$('.mapTileContainer.potentialPlacement .tileContainer:not(.lockedIn)').remove();
});

$(document).on(touchEvent,'.mapTileContainer.potentialPlacement',function(){

	if($('.mapTileContainer.potentialPlacement .tileContainer').length) {

		// add the class mapPreviewTileContainer to the currently cloned tile container in the map hex to be able to differentiate between the tile container that's going to be moved from the displayed are for the purposes of fading and removing the preview version
		$('.mapTileContainer.potentialPlacement .tileContainer').addClass('mapPreviewTileContainer');

		// fade out the tileContainer that was cloned into the map hex as a preview so that we can animate the final tile contents from the displayed tile area
		$('.tileContainer.mapPreviewTileContainer').fadeOut();

		setTimeout(function(){
			// now that time has passed to fade out the preview tile element that was cloned into the chosen map hex - we can safely remove the previewed tile info
			$('.tileContainer.mapPreviewTileContainer').remove();
		}, 300)
	}

	// because the user has clicked a tile+token pairing AND then clicked a map hex to finalize a tile placement, the "Replace Duplicates" button is forced to deactive (in case it was previously activated), so that clicking it mid placement doesn't screw up the code.
	// the player does have the chance to still cancel the tile placement (or even undo it once it's placed) and then they can get another oppurtunity to clear the duplicates (if there are 3 or more of the same token)
	$('#replaceDuplicateTokens').attr('disabled', 'disabled');

	// again for the reason of not confusing the code, if the player had any nature cubes - the ability to use them mid tile+token placement is deactivated so as to not confuse the underlying code
	$('.useNatureCube.button').attr('disabled', 'disabled');
	
	// store the id of the map hex currently chosen
	// e.g. -->  row-20-column-19
	var targID = $(this).attr('id');  

	// remove the potentialPlacement class from of the map hex elements, since we don't need to preview anymore tile information now that a tile placement has been finalized
	$('.mapTileContainer.potentialPlacement').removeClass('potentialPlacement');

	// adding the 'lockedIn' class allows differentiation between all of the other tile html in map div once the tile html is animated and transferred into the map
	// this class will be removed once the tile is finalized	
	$('.tokenTileContainer.chosenTokenTileContainer .tileContainer').addClass('lockedIn')

	// now that the chosen tile has been selected by the user AND a valid hex on the map has also been clicked on to move the chosen tile - all of the other tile+token elements have an inactive class added in order to show that they are currently off limits to be chosen
	// this was not done previously as even once the user had clicked JUST the displayed tile+tokencombination, they could just as easily click another container to change their mind
	$('.tokenTileContainer:not(.chosenTokenTileContainer)').addClass('inactive');

	temporarilyLockMap(1000);

	// move the chosen displayed tile onto the chosen blank map hex
	$('.tokenTileContainer.chosenTokenTileContainer .tileContainer.lockedIn').parentToAnimate($('#' + targID), 1000);

	setTimeout(function(){
		// adding the showOptions class to the #placedTileOptions element causes it to slideUp for the user to view the options, such as rotating the tile, confirming the placement, or cancelling the placement
		$('#mapContainer #placedTileOptions').addClass('showOptions');
		$('.mobileTilePlacementOptions.inactiveTileOptions').addClass('activeTileOptions').removeClass('inactiveTileOptions');
		rotateTileAllowed = true;
	}, 300)
	
})


$(document).on('mouseenter','.mapTileContainer.potentialNatureCubeTilePlacement',function(){
	// this event listener is activated once a player has clicked the Nature Cubes button (if they have any to use), clicked a tile to place (which will show all of the valid placements on the map which are assigned the .potentialNatureCubeTilePlacement), and THEN they hover over a valid map hex to place that chosen tile

	// target the hovered over map hex element
	var thisTile = $(this);

	// clone the chosen tile information into the valid map hex element
	$('.tokenTileContainer.potentialNatureCube.natureCubeTile .tileContainer.chosenNatureCubeTile').clone().appendTo(thisTile);

	// since cloning all of the html in the displayed tile info ALSO clones the yellow outline which currently indicates which displayed tile has been chosen, when duplicating this on the map we can remove this element (since the user obviously knows which tile is currently being duplicated since that's where their mouse is)
	$('.mapTileContainer.potentialNatureCubeTilePlacement .tileContainer:not(.lockedIn) .selectedTileOutline').remove();
});

$(document).on('mouseleave','.mapTileContainer.potentialNatureCubeTilePlacement',function(){
	// whenever the user moves their mouse from an area of the map that's currently showing a tile preview for placement, remove that previewed tile information
	$('.mapTileContainer.potentialNatureCubeTilePlacement .tileContainer').remove();
});

$(document).on(touchEvent,'.mapTileContainer.potentialNatureCubeTilePlacement',function(){

	if($('.mapTileContainer.potentialNatureCubeTilePlacement .tileContainer').length) {

		// add the class mapPreviewTileContainer to the currently cloned tile container in the map hex to be able to differentiate between the tile container that's going to be moved from the displayed are for the purposes of fading and removing the preview version
		$('.mapTileContainer.potentialNatureCubeTilePlacement .tileContainer').addClass('mapPreviewTileContainer');

		// fade out the tileContainer that was cloned into the map hex as a preview so that we can animate the final tile contents from the displayed tile area
		$('.mapTileContainer.potentialNatureCubeTilePlacement .tileContainer').fadeOut();

		setTimeout(function(){
			// now that time has passed to fade out the preview tile element that was cloned into the chosen map hex - we can safely remove the previewed tile info
			$('.tileContainer.mapPreviewTileContainer').remove();
		}, 400)
	}

	rotateTileAllowed = false;
	
	// store the id of the map hex currently chosen
	// e.g. -->  row-20-column-19
	var targID = $(this).attr('id'); 

	// remove the potentialNatureCubeTilePlacement class from of the map hex elements, since we don't need to preview anymore tile information now that a tile placement has been finalized
	$('.mapTileContainer.potentialNatureCubeTilePlacement').removeClass('potentialNatureCubeTilePlacement');

	// adding the 'lockedIn' class allows differentiation between all of the other tile html in map div once the tile html is animated and transferred into the map
	// this class will be removed once the tile is finalized	
	$('.tokenTileContainer.potentialNatureCube.natureCubeTile .tileContainer.chosenNatureCubeTile').addClass('lockedIn')

	temporarilyLockMap(1000);

	// move the chosen displayed tile onto the chosen blank map hex
	$('.tokenTileContainer.potentialNatureCube.natureCubeTile .tileContainer.chosenNatureCubeTile.lockedIn').parentToAnimate($('#' + targID), 1000);

	setTimeout(function(){
		// adding the showOptions class to the #placedTileOptions element causes it to slideUp for the user to view the options, such as rotating the tile, confirming the placement, or cancelling the placement
		$('#mapContainer #placedTileOptions').addClass('showOptions');
		$('.mobileTilePlacementOptions.inactiveTileOptions').addClass('activeTileOptions').removeClass('inactiveTileOptions');
	}, 300)

})

$(document).on(touchEvent,'#cancelTilePlacement',function(){
	cancelTilePlacement('normalTile');
})

$(document).on(touchEvent,'#mobileMapNavContainer .mobileTilePlacementOptions.activeTileOptions .mobileTilePlacementCancel:not(.natureCubeMode)',function(){
	cancelTilePlacement('normalTile');
})

$(document).on(touchEvent,'#cancelNatureCubeTilePlacement',function(){
	cancelTilePlacement('natureCubeTile');
})

$(document).on(touchEvent,'#mobileMapNavContainer .mobileTilePlacementOptions.activeTileOptions .mobileTilePlacementCancel.natureCubeMode',function(){
	cancelTilePlacement('natureCubeTile');
})


$(document).on(touchEvent,'#confirmTilePlacement',function(){
	confirmTilePlacement();
	activateTokenPlacement('normalToken');
});

$(document).on(touchEvent,'#mobileMapNavContainer .mobileTilePlacementOptions.activeTileOptions .mobileTilePlacementConfirm:not(.natureCubeMode)',function(){
	confirmTilePlacement();
	activateTokenPlacement('normalToken');
});

$(document).on(touchEvent,'#confirmNatureCubeTilePlacement',function(){
	confirmTilePlacement();
	setupNatureCubeTokenSelection();
});

$(document).on(touchEvent,'#mobileMapNavContainer .mobileTilePlacementOptions.activeTileOptions .mobileTilePlacementConfirm.natureCubeMode',function(){
	confirmTilePlacement();
	setupNatureCubeTokenSelection();
});



$(document).on(touchEvent,'.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer:not(.chosenNatureCubeToken)',function(){
	//This code runs when the player has chosen to use a nature cube, has already placed a tile, and is now clicking the available tokens in order to select it to place

	// The .wildlifeTokenPotential class is assgined to the map hexes in order to preview a token on a hex that is a valid placement
	// If the class exists, it means that another token had previously been clicked - so we need to remove the details of that token off the current map hexes in order to put the new details of the newly chosen token on them
	if($('.wildlifeTokenPotential').length) {
		$('.wildlifeTokenPotential').removeAttr('wildlifetokenpotentialtype');
		$('.wildlifeTokenPotential').removeClass('wildlifeTokenPotential');
	}

	var previouslyChosenToken = '';

	// The .previouslyChosenTokenContainer is removed from the last container it was assigned to since we now assign it to the token container that has the .chosenNatureCubeToken class on it, before transferring the .chosenNatureCubeToken class to the container that triggered this function
	// $('.previouslyChosenTokenContainer').removeClass('previouslyChosenTokenContainer');

	// Again the code checks to see if another token has previously been chosen - if it has the below code is actioned in order to remove the appropraite elements and classes
	if($('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken').length) {
		// store the wildlife type of the previously chosen wildlife (we need this in order to recreate the normal token state of the previously chosen token in order to fade it back in)
		previouslyChosenToken = $('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken').attr('wildlifetoken');	
		// recreate the default token image and append the previously chosen token container with it
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken').append('<img class="token" src="img/tokens/' + previouslyChosenToken + '.png" />');
		// Add the .previouslyChosenTokenContainer in order to to target the previous token container to remove the active token once its faded out later
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken').addClass('previouslyChosenTokenContainer');
		// fade out the old active token since its now not the active token
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.previouslyChosenTokenContainer .activeToken').fadeOut();
		// remove the current .chosenNatureCubeTokenParent + chosenNatureCubeToken classes since another token is now active
		$('.chosenNatureCubeTokenParent').removeClass('chosenNatureCubeTokenParent');
		$('.chosenNatureCubeToken').removeClass('chosenNatureCubeToken');
	}

	// add the .chosenNatureCubeTokenParent + chosenNatureCubeToken classes to the token container and parent token
	$(this).addClass('chosenNatureCubeToken');
	$(this).parent().addClass('chosenNatureCubeTokenParent');

	// store the currently chosen wildlife represented by the newly chosen token in the global variablew
	currentChosenWildlife = $('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken').attr('wildlifetoken');

	// add the active state of the currently chosen token into the token container in order to fade it in
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken').append('<img class="activeToken" src="img/tokens/' + currentChosenWildlife + 'Active.png" />')

	// fade in the newly created active state of the currently selected token
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken .activeToken').fadeIn();
	// fade out the old default state of the currently selected token
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken .token').fadeOut();

	// now we can add the appropriate classes to the map hexes where the newly chosen token will be valid placements
	activateTokenPlacement('natureCubeToken');

	setTimeout(function(){
		// remove the previously chosen active token image since enough time has elapsed for it to be hidden
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.previouslyChosenTokenContainer .activeToken').remove();
		// remove the currently chosen defalt token image since enough time has elapsed for it to be hidden
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken .token').remove();
		// we don't need the .previouslyChosenTokenContainer class to be assigned so we can remove them
		$('.previouslyChosenTokenContainer').removeClass('previouslyChosenTokenContainer');
	}, 400)
})

$(document).on(touchEvent,'.tokenTileContainer.natureCubeClearTokens .tokenContainer:not(.currentTokenAnimation):not(.lockAllTokens)',function(){
	//This code runs when the player has chosen to use a nature cube to clear any number of tokens BEFORE taking their actual turn

	var currentWildlifeToken = $(this).attr('wildlifetoken');

	$(this).addClass('currentTokenAnimation');
	$('.tokenTileContainer.natureCubeClearTokens .tokenContainer').addClass('lockAllTokens');

	if (!$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation').hasClass('confirmedTokenToClear')) {
		// add the .confirmedTokenToClear to the clicked token IF IT DOESN'T ALREADY HAVE THAT CLASS as the clicked token is now chosen to be cleared
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation').addClass('confirmedTokenToClear');
		$('#confirmClearSelectedTokens').removeAttr('disabled');
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation .token').fadeOut();
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation').append('<img class="activeToken" src="img/tokens/' + currentWildlifeToken + 'Active.png" />');
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation .activeToken').fadeIn();

		setTimeout(function(){
			$('.currentTokenAnimation .token').remove();
			$('.currentTokenAnimation').removeClass('currentTokenAnimation');
			$('.lockAllTokens').removeClass('lockAllTokens');
		}, 400)

	} else if ($('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation').hasClass('confirmedTokenToClear')) {
		// remove the .confirmedTokenToClear to the clicked token IF ALREADY HAS THAT CLASS since the token is now not chosen to be cleared
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation').removeClass('confirmedTokenToClear');

		if($('.confirmedTokenToClear').length) {
			$('#confirmClearSelectedTokens').removeAttr('disabled');
		} else {
			$('#confirmClearSelectedTokens').attr('disabled', 'disabled');
		}

		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation .activeToken').fadeOut();
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation').append('<img class="token" src="img/tokens/' + currentWildlifeToken + '.png" />');
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation .token').fadeIn();
		
		setTimeout(function(){
			$('.currentTokenAnimation .activeToken').remove();
			$('.currentTokenAnimation').removeClass('currentTokenAnimation');
			$('.lockAllTokens').removeClass('lockAllTokens');
		}, 400)

	}

})

$(document).on(touchEvent,'#undoTilePlacement:not([disabled])',function(){
	// run the undoTilePlacementFunction function
	undoTilePlacementFunction();
})

$(document).on(touchEvent,'#rotateTileClockwise', rotateTileClockwiseFunction);
$(document).on(touchEvent,'#mobileMapNavContainer .mobileTilePlacementOptions.activeTileOptions .mobileTilePlacementRotateClockwise', rotateTileClockwiseFunction);

$(document).on(touchEvent,'#rotateTileCounterclockwise', rotateTileCounterClockwiseFunction);
$(document).on(touchEvent,'#mobileMapNavContainer .mobileTilePlacementOptions.activeTileOptions .mobileTilePlacementRotateCounterClockwise', rotateTileCounterClockwiseFunction);

function rotateTileClockwiseFunction() {
	// find the currently chosen tile that is currently being placed, and store it's current rotation value into a variable
	var currentRotation = parseInt($('.mapTileContainer .tileContainer.lockedIn').attr('tilerotation'));
	// add 60 degrees to the current rotation since it's being rotated clockwise
	var newRotation = currentRotation + 60;
	// update the new value on the tilerotation attribute that corresponds with chosen tile
	$('.mapTileContainer .tileContainer.lockedIn').attr('tilerotation', newRotation);
	// update the new value in the css to animate the tile moving to the new correct rotation
	$('.mapTileContainer .tileContainer.lockedIn .habitatTile').css('transform', 'rotate(' + newRotation + 'deg)');
}

function rotateTileCounterClockwiseFunction() {
	// find the currently chosen tile that is currently being placed, and store it's current rotation value into a variable
	var currentRotation = parseInt($('.mapTileContainer .tileContainer.lockedIn').attr('tilerotation'));
	// minus 60 degrees to the current rotation since it's being rotated counter-clockwise
	var newRotation = currentRotation - 60;
	// update the new value on the tilerotation attribute that corresponds with chosen tile
	$('.mapTileContainer .tileContainer.lockedIn').attr('tilerotation', newRotation);
	// update the new value in the css to animate the tile moving to the new correct <rotation></rotation>
	$('.mapTileContainer .tileContainer.lockedIn .habitatTile').css('transform', 'rotate(' + newRotation + 'deg)');
}


$(document).on('mouseenter','.mapTileContainer.placedTile.wildlifeTokenPotential',function(){
	// when the player is up to the point to place a token on the map, each valid map hex will have the .wildlifeTokenPotential class assigned to it
	// once a map hex with this class is hovered over, a copy of the currenty chosen token is created in the hex to give the player a preview of what the token will look like in relation to all of the other tile + tokens already on the board
	$(this).children().append('<img class="wildlifeToken" src="img/tokens/' + currentChosenWildlife + 'Active.png" />')
})

$(document).on('mouseleave','.mapTileContainer.placedTile.wildlifeTokenPotential',function(){
	// when the player moves their mouse off a map hex that is currently previewing a token, that token is removed
	$('.mapTileContainer.placedTile.wildlifeTokenPotential .wildlifeToken').remove();
})

$(document).on(touchEvent,'.mapTileContainer.placedTile.wildlifeTokenPotential',function(){

	temporarilyLockMap(1000);

	// this code runs while the player is currently choosing where to place a token on the board

	// TOKEN PLACEMENT CODE FOR NON-NATURE CUBE + NATURE CUBE PLACEMENTS!!!!!!

	// once the touchevent has is triggered, it signifies that the player has made their choice by clicking the map hex where the currently chosen token is currently being previewed

	// create the keystoneTile variable as false in order to update if the tile later on turns out to be a keystone tile
	// (if it is we will need to give the player a nature token)
	var keystoneTile = false;

	// since the player has now placed a tile AND token, they are not able to undo the last tile placement, so we now make the button that gives that option inactive, and also remove the .lastPlacedTile class
	$('#undoTilePlacement').attr('disabled', 'disabled');
	$('.lastPlacedTile').removeClass('lastPlacedTile');

	// store the id of the map hex container that the player has clicked to finalize the placement of the wildlife token into
	var chosenTokenTileID = $(this).closest('.mapTileContainer').attr('id');

	// add the .placedToken class
	$('#' + chosenTokenTileID).addClass('placedToken');

	// split the id using the hyphens and then store the row and column numbers in the appropriate variables as integers
	var splitChosenTokenTileID = chosenTokenTileID.split('-');
	var tokenRow = parseInt(splitChosenTokenTileID[1]);
	var tokenColumn = parseInt(splitChosenTokenTileID[3]);

	// now that the token has been placed, we can remove the "wildlifeTokenPotentialType" attribute
	$('.mapTileContainer').removeAttr('wildlifeTokenPotentialType');

	// loop through the mapData variable, find the relevant row and column
	for (let i = 0; i < mapData.length; i++) {
		if(mapData[i][0].row == tokenRow) {
			for (let j = 0; j < mapData[i].length; j++) {
				if(mapData[i][j].column == tokenColumn) {
					//run this code once the relevant row and column has been triggered, which will now target the tile details that has been chosen to place the token

					// update the placedToken attribute in the class with the currently chosen wildlife token name
					mapData[i][j].placedToken = currentChosenWildlife;

					// if the current tile only has one habitat it is a keystone tile, and the previously created variable is now updated to reflect this
					if(mapData[i][j].habitats.length == 1) {
						keystoneTile = true;
					}
				}
			}
		}
	}

	// fade out the preview token that has up to now been generated inside the map hex element as a preview for the player
	$('.mapTileContainer.placedTile.wildlifeTokenPotential .wildlifeToken').fadeOut();

	setTimeout(function(){
		// now that time has elapsed for the previewed token to be hidden, it is now removed
		$('.mapTileContainer.placedTile.wildlifeTokenPotential .wildlifeToken').remove();
	}, 400)

	// this variable will alter depending on whether the tile that has had the token placed on it is a keystone tile (there needs to be time to update the number of nature tokens the player has acces to + to animate the notification status).
	var tileTokenResetTime = 1000;

	if($('.tokenTileContainer.chosenTokenTileContainer').length) {
		// NON-NATURE CUBE TILE PLACEMENT CODE
		// this part of the if statement is triggered if its a standard token+tile pairing that is currently being placed and resolved

		// first of all, move the chosen token from the display area onto the chosen tile

		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .activeToken').attr('wildlife', currentChosenWildlife);
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .activeToken').parentToAnimate($('#' + chosenTokenTileID), 1000);
		
		if(keystoneTile) {
			// if the keystoneTile variable is true, immediately update the tileTokenResetTime variable to 2500 to give time for the nature cube addition animate to conclude
			tileTokenResetTime = 2500;

			setTimeout(function(){
				// ANIMATE NATURE TOKEN TO MOVE TO THE NATURE TOKEN BUTTON AREA!

				natureCubesNum++;
				updateNatureCubesNum(false);

				let tileParentOffest = $('#' + chosenTokenTileID + ' .activeToken').offset();

				$('body').append('<div id="earnedNatureTokenContainer"><img class="earnedNatureToken" src="img/tokens/nature-token.png" /><p class="plusOneText">+1</p></div>');

				let keystoneTileTopPos = tileParentOffest.top;
				let keystoneTileLeftPos = tileParentOffest.left - 15;

				$('#earnedNatureTokenContainer').css({
					'position': 'absolute',
					'top': keystoneTileTopPos,
					'left': keystoneTileLeftPos,
					'zIndex': 9
				});

				setTimeout(function(){
					$('#earnedNatureTokenContainer').addClass('animationEnabled');
				}, 10)

				setTimeout(function(){
					let animatedTopPos = keystoneTileTopPos - 120;
					$('#earnedNatureTokenContainer').css({
						'opacity': 1,
						'top': animatedTopPos
					});
				}, 20)

				setTimeout(function(){
					$('#earnedNatureTokenContainer').css('opacity', '0');
				}, 1500)

				setTimeout(function(){
					$('#earnedNatureTokenContainer').remove();
				}, 2500)

			}, 1050);

		}

		// Now that enough time has elapsed to finish the animation of the token moving from the display area onto the chosen tile AND/OR the nature cube button to have the relevantr animation applied, the code runs the rest of the turn end upkeep
		setTimeout(function(){
			// the tiles and tokens are removed based on the solo mechanism ( the bottom-most tile and the bottom-most token)
			removeSoloTilesTokens();

			// the token that was moved from the display area onto the map now has it's activeToken class removed and has the .placedWildlifeToken class added to it in order to differentiate from future .activeTokens that will be chosen
			$('.activeToken').addClass('placedWildlifeToken').removeClass('activeToken');
			// the map hex that was chosen to place the token can now have the wildlife attribute removed from it since we will never need to preview anymore tokens in relation to that map hex again
			$('#' + chosenTokenTileID + ' .tileContainer').removeAttr('wildlife');
			
		}, tileTokenResetTime);

	} else if($('.tokenTileContainer.potentialNatureCube').length) {
		// NATURE CUBE TOKEN PLACEMENT CODE

		// this part of the if statement is triggered if a nature cube has been used to choose the current tile and token
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .activeToken').attr('wildlife', currentChosenWildlife);
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .activeToken').parentToAnimate($('#' + chosenTokenTileID), 1000);

		if(keystoneTile) {
			// if the keystoneTile variable is true, immediately update the tileTokenResetTime variable to 2500 to give time for the nature cube addition animate to conclude
			tileTokenResetTime = 2500;

			setTimeout(function(){
				// ANIMATE NATURE TOKEN TO MOVE TO THE NATURE TOKEN BUTTON AREA!

				natureCubesNum++;
				updateNatureCubesNum(false);

				let tileParentOffest = $('#' + chosenTokenTileID + ' .activeToken').offset();

				$('body').append('<div id="earnedNatureTokenContainer"><img class="earnedNatureToken" src="img/tokens/nature-token.png" /><p class="plusOneText">+1</p></div>');

				let keystoneTileTopPos = tileParentOffest.top;
				let keystoneTileLeftPos = tileParentOffest.left - 15;

				$('#earnedNatureTokenContainer').css({
					'position': 'absolute',
					'top': keystoneTileTopPos,
					'left': keystoneTileLeftPos,
					'zIndex': 9
				});

				setTimeout(function(){
					$('#earnedNatureTokenContainer').addClass('animationEnabled');
				}, 10)

				setTimeout(function(){
					let animatedTopPos = keystoneTileTopPos - 120;
					$('#earnedNatureTokenContainer').css({
						'opacity': 1,
						'top': animatedTopPos
					});
				}, 20)

				
				setTimeout(function(){
					$('#earnedNatureTokenContainer').css('opacity', '0');
				}, 1100)

				setTimeout(function(){
					$('#earnedNatureTokenContainer').remove();
				}, 2500)

			}, 1050)

		}

		// Now that enough time has elapsed to finish the animation of the token moving from the display area onto the chosen tile AND/OR the nature cube button to have the relevantr animation applied, the code runs the rest of the turn end upkeep
		setTimeout(function(){
			// if the user previously cleared duplicates on a previous turn (given they can only do this once per turn), they now gain the ability back since it's now a new turn
			duplicatesClearedThisTurn = false;
			// the tiles and tokens are removed based on the solo mechanism ( the bottom-most tile and the bottom-most token)
		
			$('.tokenTileContainer').removeClass('potentialNatureCube').addClass('finishedNatureCubePlacement');

			removeSoloTilesTokens();
			// the .potentialNatureCube class is removed ready for the next turn
			// $('.potentialNatureCube').removeClass('potentialNatureCube');
			// the token that was moved from the display area onto the map now has it's activeToken class removed and has the .placedWildlifeToken class added to it in order to differentiate from future .activeTokens that will be chosen
			$('.activeToken').addClass('placedWildlifeToken').removeClass('activeToken');
			currentChosenWildlife = '';
			// the global variable "currentChosenWildlife" that corresponds with the currently chosen token is cleared ready for the next turn
			$('#' + chosenTokenTileID + ' .tileContainer').removeAttr('wildlife');
			
			// remove all natureCube associated classes from the displayed area
			$('.natureCubeToken').removeClass('natureCubeToken');
			$('.chosenNatureCubeToken').removeClass('chosenNatureCubeToken');
			$('.chosenNatureCubeTokenParent').removeClass('chosenNatureCubeTokenParent');
			$('.chosenNatureCubeTileParent').removeClass('chosenNatureCubeTileParent');

		}, tileTokenResetTime);

	}
	
	// hide the small wildlife tokens the are "printed" on the tile now that is has a token placed on it
	$('#' + chosenTokenTileID + ' .tileContainer .tileToken').fadeOut();

	// remove the .wildlifeTokenPotential since we're not needing to preview a token on the valid map hexes anymore
	$('.wildlifeTokenPotential').removeClass('wildlifeTokenPotential');

})


$(document).on(touchEvent,'#natureCubePickAnyTileToken',function(){
	// This code is actioned once a player has clicked the "Nature Cube" button AND clicked the "Use Nature Cube" confirmation button

	// Show the nature cube related buttons in the tile placement options box (which will only be displayed once a tile has been placed), and hide the non-nature cube related buttons
	$('.nonNatureCubeButton').hide();
	$('.natureCubeButton').show();
	$('.mobileTilePlacementOptions .mobileTilePlacementOption').addClass('natureCubeMode');

	// Remove a nature cube and run the updateNatureCubesNum() function to update the amount of nature cubes available displayed on the button
	natureCubesNum--;
	// the false is to signify to NOT deactivate the button, since the player is still taking their turn at this point
	updateNatureCubesNum(false);
	// if there were 3 or more duplicated tokens the player has missed the opportunity to clear them, so the button is deactivated
	$('#replaceDuplicateTokens').attr('disabled', 'disabled');

	// remove the .is-active class from the currently displayed modal that pertains to the nature cube information to hide it
	$('.modal.is-active').removeClass('is-active');

	// add the .potentialNatureCube and the .natureCubeTile classes to all 4 .tokenTileContainer that correspond with the 4 displayed containers containing the tile+token combinations
	$('.tokenTileContainer').addClass('potentialNatureCube natureCubeTile');

	// add the is-active class to the modal that instructs the player to first the tile that they want to place
	$('#natureCubesPlaceTileModal').addClass('is-active');

})

$(document).on(touchEvent,'#natureCubeClearAnyTokens',function(){
	clearAnyTokensWithNatureCube();
})

$(document).on(touchEvent,'#natureCubeClearSomeTokens',function(){
	clearAnyTokensWithNatureCube();
})

function clearAnyTokensWithNatureCube() {
	// This code is actioned once a player has clicked the "Nature Cube" button AND clicked the "Use Nature Cube" confirmation button

	// Remove a nature cube and run the updateNatureCubesNum() function to update the amount of nature cubes available displayed on the button
	natureCubesNum--;
	// the false is to signify to NOT deactivate the button, since the player is still taking their turn at this point
	updateNatureCubesNum(false);

	// if there were 3 or more duplicated tokens the player has missed the opportunity to clear them, so the button is deactivated
	$('#replaceDuplicateTokens').attr('disabled', 'disabled');

	// remove the .is-active class from the currently displayed modal that pertains to the nature cube information to hide it
	$('.modal.is-active').removeClass('is-active');

	// add the "Clear Selected Tokens" to the #tileTokenContainer (the element which holds all of the individual .tokenTileContainer elements)
	// By default it is disabled since there are no chosen tokens to replace
	$('#tileTokenContainer').append('<button id="confirmClearSelectedTokens" class="button is-success" disabled="disabled">Clear Tokens</button><button id="selectAllTokensToClear" class="button is-info">Select All</button>');

	// add the is-active class to the modal that instructs the player to first the tile that they want to place
	$('#natureCubesClearAnyNumberOfTokensModal').addClass('is-active');
}


$(document).on(touchEvent,'#natureCubesClearAnyNumberOfTokensModal .closeModalTrigger',function(){
	// now the player will be choosing a token to place, add the .natureCubeToken class to each tile+token container

	$('.tokenTileContainer').addClass('natureCubeClearTokens');

	setTimeout(function(){
		$('#tileTokenContainer').addClass('natureCubeTempDimensions');
		// the revealButton class is added to the button to animate it sliding into view at the same time that the tileToken containers will slide down to allow for more room
		$('#confirmClearSelectedTokens').addClass('revealButton');
		// the revealButton class is added to the button to animate it sliding into view at the same time that the tileToken containers will slide down to allow for more room
		$('#selectAllTokensToClear').addClass('revealButton');
	}, 50);
})

$(document).on(touchEvent,'#selectAllTokensToClear',function(){

	$('#confirmClearSelectedTokens').removeAttr('disabled');

	$('.tokenTileContainer.natureCubeClearTokens .tokenContainer:not(.confirmedTokenToClear)').addClass('lockAllTokens');

	selectAllTokensToClearFunction();

	$('.tokenTileContainer.natureCubeClearTokens .tokenContainer:not(.confirmedTokenToClear)').addClass('currentTokenAnimation');
	$('.tokenTileContainer.natureCubeClearTokens .tokenContainer:not(.confirmedTokenToClear) .token').fadeOut();
	$('.tokenTileContainer.natureCubeClearTokens .tokenContainer:not(.confirmedTokenToClear) .activeToken').fadeIn();

	setTimeout(function(){
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer').addClass('confirmedTokenToClear');
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation .token').remove();
		$('.tokenTileContainer.natureCubeClearTokens .tokenContainer.currentTokenAnimation').removeClass('currentTokenAnimation');
		$('.lockAllTokens').removeClass('lockAllTokens');
	}, 400)
})

$(document).on(touchEvent,'#confirmClearSelectedTokens:not([disabled])',function(){
	$('#confirmClearSelectedTokens').attr('disabled', 'disabled');
	$('#selectAllTokensToClear').attr('disabled', 'disabled');

	// now the player will be choosing a token to place, add the .natureCubeToken class to each tile+token container

	// now the player will be choosing a token to place, add the .natureCubeToken class to each tile+token container
	
	$('.natureCubeTempDimensions').removeClass('natureCubeTempDimensions');
	$('.tokenTileContainer').addClass('inactive');

	// now the player will be choosing a token to place, add the .natureCubeToken class to each tile+token container

	setTimeout(function(){
		$('.tokenTileContainer.natureCubeClearTokens').removeClass('natureCubeClearTokens');
	}, 700)

	// the revealButton class is added to the button to animate it sliding into view at the same time that the tileToken containers will slide down to allow for more room
	$('#confirmClearSelectedTokens').removeClass('revealButton');
	// the revealButton class is added to the button to animate it sliding into view at the same time that the tileToken containers will slide down to allow for more room
	$('#selectAllTokensToClear').removeClass('revealButton');

	setTimeout(function(){
		removeNatureCubeChosenTokens();
	}, 600)
})

function selectAllTokensToClearFunction(){
	$('.tokenTileContainer.natureCubeClearTokens .tokenContainer:not(.confirmedTokenToClear)').each(function(){
		let currentWildlifeToken = $(this).attr('wildlifetoken');
		$(this).append('<img class="activeToken" src="img/tokens/' + currentWildlifeToken + 'Active.png" />');
	});
}

$(document).on(touchEvent,'#natureCubeClearAllTokens',function(){
	// Remove a nature cube and run the updateNatureCubesNum() function to update the amount of nature cubes available displayed on the button
	natureCubesNum--;
	// the false is to signify to NOT deactivate the button, since the player is still taking their turn at this point
	updateNatureCubesNum(false);

	// if there were 3 or more duplicated tokens the player has missed the opportunity to clear them, so the button is deactivated
	$('#replaceDuplicateTokens').attr('disabled', 'disabled');

	// remove the .is-active class from the currently displayed modal that pertains to the nature cube information to hide it
	$('.modal.is-active').removeClass('is-active');

	removeDuplicateTokens(4);
})


$(document).on(touchEvent,'.tokenTileContainer.potentialNatureCube.natureCubeTile .tileContainer',function(){
	// this code runs when the player clicks one of the available displayed tiles WHILE in the Nature Cube mode

	// if there was a previously chosen nature cube tile, remove the following two classes, and remove the previously generated .selectedTileOutline element (the yellow hex border) in order to reset the previous choice
	$('.chosenNatureCubeTile').removeClass('chosenNatureCubeTile');
	$('.chosenNatureCubeTileParent').removeClass('chosenNatureCubeTileParent');
	$('.selectedTileOutline').remove();	

	// target the currently clicked on container and add the following two classes directly to the tileContainer and the tileContainers parent
	$(this).addClass('chosenNatureCubeTile');
	$(this).parent().addClass('chosenNatureCubeTileParent');
	// insert the yellow hex border into the currently selected tileContainer to show which tile is now currently selected
	$(this).append('<img class="selectedTileOutline" src="img/selectedTile.png" />');

	// generate the opaque yellow hexes on the map to show all the possible placements for the currently selected tile
	showPossibleTilePlacements('natureCube');
})


$(document).on(touchEvent,'#cancelInvalidTokenPlacement',function(){
	// if the current token is invalid (no valid tiles to place it on), and the player decides not to remove the token from the game, the whole tile placement is undone, to give the player of choosing another tile+token combination
	undoTilePlacementFunction();
})


$(document).on(touchEvent,'#cancelInvalidNatureCubeTokenPlacement',function(){
	// USING THE NATURE CUBE FUNCTION
	// if the current token is invalid (no valid tiles to place it on), and the player decides not to remove the token from the game, then ONLY the active token classes and elements are reversed, since in the nature cube process, the tile and token placements are two separate processes.

	// target the currently chosen wildlife token using the .chosenNatureCubeToken class and store the wildlife type in the "previouslyChosenToken" variable
	var previouslyChosenToken = $('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken').attr('wildlifetoken');	
	// recreate the standard default token image in the currently chosen token container
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken').append('<img class="token" src="img/tokens/' + previouslyChosenToken + '.png" />');
	// fade in the newly created default image state of the declined token
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer.chosenNatureCubeToken .token').fadeIn()
	// hide the active state image of the declined wildlife token
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer .activeToken').fadeOut();
	// hide the active state image of the declined wildlife token
	$('.tokenTileContainer.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken').addClass('previouslyChosenTokenContainer');
	// remove the .chosenNatureCubeTokenParent and the .chosenNatureCubeToken classes since there is no currently active token choices again
	$('.chosenNatureCubeTokenParent').removeClass('chosenNatureCubeTokenParent');
	$('.chosenNatureCubeToken').removeClass('chosenNatureCubeToken');

	setTimeout(function(){
		// now tyhat enough time has elapsed, remove the old active token image of the previously declined token
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer .activeToken').remove();
	}, 400)

})

$(document).on(touchEvent,'#confirmInvalidTokenPlacement',function(){
	// once the player has been warned that the currently chosen token cannot be placed anywhere and will be removed from the game, if they decide to proceed, the following function is run
	confirmInvalidTokenPlacementFunction();
})

$(document).on(touchEvent,'#confirmInvalidNatureCubeTokenPlacement',function(){
	// once the player has been warned that the currently chosen token (THROUGH THE NATURE CUBE PROCESS) cannot be placed anywhere and will be removed from the game, if they decide to proceed, the following function is run
	confirmInvalidNatureCubeTokenPlacementFunction();
})

$(document).on(touchEvent,'#lastTurnModal .closeModalTrigger',function(){
	endOfGameSetup()
})

function deactivateChosenTile() {
	// if a player has previously clicked on a tile container which activates that particular tile and shows all the valid placements on the map BUT then performs another action to nullify the placing of the tile, this function removes all related classes and elements that correspond with the tile placement action
	$('.chosenTokenTileContainer').removeClass('chosenTokenTileContainer');
	$('.selectedTileOutline').remove();
	$('.validPlacement').remove();
}

function temporarilyLockMap(timePeriod) {
	lockMap = true;
	setTimeout(function(){
		lockMap = false;
	}, timePeriod);
}

function setupNatureCubeTokenSelection() {

	// once a player has placed a tile using the NATURE CUBE - related Tile, the below code is actioned to get ready for the player to be able to choose a token

	// because the tile has been placed, removed the .chosenNatureCubeTile + .natureCubeTile classes
	$('.chosenNatureCubeTile').removeClass('chosenNatureCubeTile');
	$('.natureCubeTile').removeClass('natureCubeTile');

	// now the player will be choosing a token to place, add the .natureCubeToken class to each tile+token container
	$('.tokenTileContainer.potentialNatureCube').addClass('natureCubeToken')

	// since the tile has been finalized, the tile placement options element can have the .showOptions class removed again to hide it
	$('#placedTileOptions').removeClass('showOptions');

	$('.mobileTilePlacementOptions.activeTileOptions').addClass('inactiveTileOptions').removeClass('activeTileOptions');

	// remove the yellow colored border to show the active tile since there's no need for it now
	$('.selectedTileOutline').remove();

	// add the .is-active class to the modal instructing the player to now choose a token to place
	$('#natureCubesPlaceTokenModal').addClass('is-active');
}

function confirmTilePlacement() {

	rotateTileAllowed = false;

    // mode = normalTile
    // mode = natureCubeTile

    // Now that the user has finalized the tile placement, the option to completely undo the tile placement is provided by activating the relevant button
    $('#undoTilePlacement').removeAttr('disabled');
    

    // fade out the opaque yellow hexes showing the valid placements since the user has now finalized the tile placement
    $('.validPlacement').fadeOut();

    // target the confirmed tile in the map which will be the one with the .lockedIn class still assigned
    var confirmedTile = $('.tileContainer.lockedIn');
    
    // store the map hex ID that has had the newly moved tile confirmed into it
	// e.g. -->  row-20-column-19
    var confirmedTileID = confirmedTile.parent().attr('id');
    
    // add the .placedTile class, which is used by the activateTokenPlacement() function to identify which tiles will be able to a relevant token placed on it
    $('#' + confirmedTileID).addClass('placedTile');
    
    // now that the map hex parent element has the .lastPlacedTile class added, we can remove the .lockedIn class from the tileContainer child element
    $('.lockedIn').removeClass('lockedIn');
    
    
	// split the id based on the hyphens into an array and store in the "splitConfirmedTileID" variable
	// row-20-column-19
	// becomes:
	// splitConfirmedTileID = ['row', '20', 'column', '19']
	var splitConfirmedTileID = confirmedTileID.split('-');

	// convert the row string into a num and store in 'confirmedTileRow' var
	var confirmedTileRow = parseInt(splitConfirmedTileID[1]);

	// mapStats.tileExtremes.row.top
	// mapStats.tileExtremes.row.bottom
	// mapStats.tileExtremes.column.left
	// mapStats.tileExtremes.column.right
	
	if((mapStats.centerRow - confirmedTileRow) >= mapStats.tileExtremes.row.top) {
		mapStats.tileExtremes.row.top = mapStats.centerRow - confirmedTileRow;

		if(mapStats.directionStatus.up == 'tileLimit-locked') {
			mapStats.directionStatus.up = 'unlocked';
			$('.upArrow').show();
		}
	}
	
	if((mapStats.centerRow - confirmedTileRow) < mapStats.tileExtremes.row.bottom) {
		mapStats.tileExtremes.row.bottom = mapStats.centerRow - confirmedTileRow;

		if(mapStats.directionStatus.down == 'tileLimit-locked') {
			mapStats.directionStatus.down = 'unlocked';
			$('.downArrow').show();
		}

	}

	// convert the column string into a num and store in 'confirmedTileColumn' var
	var confirmedTileColumn = parseInt(splitConfirmedTileID[3]);

	if((mapStats.centerColumn - confirmedTileColumn) > mapStats.tileExtremes.column.left) {
		mapStats.tileExtremes.column.left = mapStats.centerColumn - confirmedTileColumn;

		if(mapStats.directionStatus.left == 'tileLimit-locked') {
			mapStats.directionStatus.left = 'unlocked';
			$('.leftArrow').show();
		}
	}

	if((mapStats.centerColumn - confirmedTileColumn) < mapStats.tileExtremes.column.right) {
		mapStats.tileExtremes.column.right = mapStats.centerColumn - confirmedTileColumn;

		if(mapStats.directionStatus.right == 'tileLimit-locked') {
			mapStats.directionStatus.right = 'unlocked';
			$('.rightArrow').show();
		}
	}

	// the newly placed tile container is now being directly targetted to store the various aspects of it
	// an example of the opening tag of a placed tile container:
	// <div class="tileContainer chosenNatureCubeTile lockedIn" habitats="mountain desert" wildlife="hawk fox" tilewildlife="2" tilerotation="300" style="">

	// store habitats into "confirmedTileHabitats" array
	// e.g. confirmedTileHabitats = ['mountain', 'desert']
	var confirmedTileHabitats = confirmedTile.attr('habitats').split(' ');

	// store wildlife into "confirmedTileWildlife" array
	// e.g. confirmedTileWildlife = ['hawk', 'fox']
	var confirmedTileWildlife = confirmedTile.attr('wildlife').split(' ');

	// store the current tile rotation into "confirmedTileRotation" variable (don't need an array for this one since it's just one figure)
	// e.g. confirmedTileRotation = "300";
	var confirmedTileRotation = confirmedTile.attr('tilerotation');

	// loop through the mapData array in order to update the newly placed tile information
	for (let i = 0; i < mapData.length; i++) {

		// we just need to target the first child under each top level tier in the array to ascertain what row the next level corresponds with
		// (the code is looking for row 20)

		// 0: {row: 16, column: 13, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
		// 1: {row: 17, column: 13, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
		// 2: {row: 18, column: 13, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
		// 3: {row: 19, column: 13, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
		// 4: {row: 20, column: 13, placedTile: false, habitats: Array(0), wildlife: Array(0), …}

		// match = index 4
		// mapData[4] contains the row that the code needs to update
		// once the row matches that row of the map hex, that index is looped through to find the appropriate column
		if(mapData[i][0].row == confirmedTileRow) {

			for (let j = 0; j < mapData[i].length; j++) {

				// mapData[4] = [
					// 0: {row: 20, column: 13, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
					// 1: {row: 20, column: 14, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
					// 2: {row: 20, column: 15, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
					// 3: {row: 20, column: 16, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
					// 4: {row: 20, column: 17, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
					// 5: {row: 20, column: 18, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
					// 6: {row: 20, column: 19, placedTile: false, habitats: Array(0), wildlife: Array(0), …}
				//]

				if(mapData[i][j].column == confirmedTileColumn) {
					// in example mapData[4][6] would match row-20-column-19 id
					// now the code updates the details in that entry with the new information from the placed tile

					mapData[i][j].placedTile = true;
					mapData[i][j].rotation = confirmedTileRotation;

					for (let k = 0; k < confirmedTileHabitats.length; k++) {
						mapData[i][j].habitats.push(confirmedTileHabitats[k]);
					}

					for (let l = 0; l < confirmedTileWildlife.length; l++) {
						mapData[i][j].wildlife.push(confirmedTileWildlife[l]);
					}
				}
			}
		}
	}

	// the .lastPlacedTile class is added for the purposes of the undo button (to identify which map hex contains the tileContainer element to be moved back to the display area)
	// it is added AFTER the checkMapConstraints() function in case the map is extended and re-rendered, so that the .lastPlacedTile class is not removed in the process
    $('#' + confirmedTileID).addClass('lastPlacedTile');
}

function cancelTilePlacement(mode) {

	temporarilyLockMap(1000);

	rotateTileAllowed = false;

    if(mode == 'normalTile') {
		// since the tile has already been moved from the display area onto the map - we now need to move the tile back FROM the map hex it's previously been moved to TO the same place in the display area it was taken from
        $('.mapTileContainer .tileContainer.lockedIn').parentToAnimate($('.tokenTileContainer.chosenTokenTileContainer'), 1000);

        // we can remove the inactive class from all of the tile+token combination containers, since the user will again need to choose another combination again
	    $('.inactive').removeClass('inactive');

    } else if(mode == 'natureCubeTile') {
        // since the tile has already been moved from the display area onto the map - we now need to move the tile back FROM the map hex it's previously been moved to TO the same place in the display area it was taken from
        $('.mapTileContainer .tileContainer.chosenNatureCubeTile.lockedIn').parentToAnimate($('.tokenTileContainer.chosenNatureCubeTileParent'), 1000);
    }

    // the class locked in was previously assigned to the tile that was moved to the map hex - so we can remove this now
    $('.lockedIn').removeClass('lockedIn');

    // removing the "showOptions" class causes the option bar to retract until the next tile is placed
	$('#placedTileOptions').removeClass('showOptions');

	$('.mobileTilePlacementOptions.activeTileOptions').addClass('inactiveTileOptions').removeClass('activeTileOptions');

	// the yellow border around the chosen hex is faded out since there is now no currently selected hex
	$('.selectedTileOutline').fadeOut();

	// the opaque yellow hexes are faded out since there is no chosen tiles again
	$('.validPlacement').fadeOut();
    
    if(mode == 'normalTile') {
        // remove the .chosenTokenTileContainer class since the user has reset which tile has been chosen
        $('.chosenTokenTileContainer').removeClass('chosenTokenTileContainer');

        // QUESTION
        // No other code above seems to reference lastPlacedTile? I think this is only assigned after the "Confirm" button has been clicked in order for the "Undo Last Tile Placement" to work - not need right now???
        // $('.lastPlacedTile').removeClass('lastPlacedTile');

		// give the player the option of using the nature cubes again
		// the true is to reactivate the button so that it can be used again
        updateNatureCubesNum(true);		

        // again we can run the check for duplicate tokens since we want to be able to give the user the ability to clear the tokens if there's three of the same, since they've gone back to the state in the game of BEFORE placing a tile - meaning that this is a valid option again (if they haven't already cleared 3 duplicates - but the function checks this criteria)
        checkDuplicateTokens();

    } else if(mode == 'natureCubeTile') {
        // remove the .chosenNatureCubeTileParent + the .chosenNatureCubeTile classes since the user has reset which tile has been chosen
        $('.chosenNatureCubeTileParent').removeClass('chosenNatureCubeTileParent');
        $('.chosenNatureCubeTile').removeClass('chosenNatureCubeTile');
    }

    setTimeout(function(){
		// the yellow border around the chosen hex is now removed since enough time has elapsed for it to fade out
		$('.selectedTileOutline').remove();
		// the opaque yellow hexes are faded out are now removed since enough time has elapsed for it to fade out
		$('.validPlacement').remove();
	}, 400)
}

function confirmInvalidTokenPlacementFunction() {
	// NON-NATURE CUBE CODE
	// For when the player has selected a token that can't be placed on any tile, and the player has confirmed to remove the token from the game

	// add the inactive version of the removed wildlife token intot he container, along with a red cross
	$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer').append('<img class="duplicateToken" src="img/tokens/' + currentChosenWildlife + 'Inactive.png" />');
	$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer').append('<img class="redCross" src="img/cross.png" />');

	// fade out the activeToken class which corresponds with the active image of token 
	$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .activeToken').fadeOut();

	// fade in the inactive version of the removed wildlife token and the cross to show to the user its about to be removed
	$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .duplicateToken').fadeIn();
	$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .redCross').fadeIn();

	setTimeout(function(){
		// remove the previously hidden active version of the wildlife token
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .activeToken').remove();

		// fade out the inactive version of the removed wildlifer token and the red cross to represent the token being completely removed from the game
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .duplicateToken').fadeOut();
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .redCross').fadeOut();
	}, 500)

	setTimeout(function(){
		// now that time has elapsed for the inactive version of the removed token and the red cross to be hidden, they can now be removed from the game
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .duplicateToken').remove();
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .redCross').remove();

		// now that the user has had their tile placed, and their token action finalized (in this case, the token removed from the game), the tile+tokens pairing that the solo player picks can now be removed from the game
		removeSoloTilesTokens();
		
	}, 1000)
}
		
function confirmInvalidNatureCubeTokenPlacementFunction() {
	// NATURE CUBE CODE

	// add the inactive version of the removed wildlife token intot he container, along with a red cross
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken').append('<img class="duplicateToken" src="img/tokens/' + currentChosenWildlife + 'Inactive.png" />');
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken').append('<img class="redCross" src="img/cross.png" />');

	// fade out the activeToken class which corresponds with the active image of token 
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .activeToken').fadeOut();

	// fade in the inactive version of the removed wildlife token and the cross to show to the user its about to be removed
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .duplicateToken').fadeIn();
	$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .redCross').fadeIn();

	setTimeout(function(){
		// remove the previously hidden active version of the wildlife token
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .activeToken').remove();

		// fade out the inactive version of the removed wildlifer token and the red cross to represent the token being completely removed from the game
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .duplicateToken').fadeOut();
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .redCross').fadeOut();
	}, 1000)

	setTimeout(function(){
		// now that time has elapsed for the inactive version of the removed token and the red cross to be hidden, they can now be removed from the game
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .duplicateToken').remove();
		$('.tokenTileContainer.potentialNatureCube.natureCubeToken.chosenNatureCubeTokenParent .tokenContainer.chosenNatureCubeToken .redCross').remove();

		// remove all of the nature cube related classes from the various elements to prepare for the next turn
		$('.natureCubeToken').removeClass('natureCubeToken');
		$('.potentialNatureCube').removeClass('potentialNatureCube');
		$('.chosenNatureCubeTokenParent').removeClass('chosenNatureCubeTokenParent');
		$('.chosenNatureCubeTileParent').removeClass('chosenNatureCubeTileParent');

		// now that the user has had their tile placed, and their token action finalized (in this case, the token removed from the game), the tile+tokens pairing that the solo player picks can now be removed from the game
		removeSoloTilesTokens();

	}, 1500);
}

function undoTilePlacementFunction() {

	temporarilyLockMap(1000);

	// NATURE CUBE + NON-NATURE CUBE FUNCTION

	// deactivate the Undo Last TIle Placement button since it won't be able to be used again until another tile has been placed
	$('#undoTilePlacement').attr('disabled', 'disabled');

	// target the map hex that has the .lastPlacedTile class assigned to it signifying the last place tile
	var lastPlacedTileID = $('.mapTileContainer.lastPlacedTile').attr('id');
	
	// split the id and store the row and column information as integers in the relevant variables
	var splitlastPlacedTileID = lastPlacedTileID.split('-');
	var lastPlacedTileRow = parseInt(splitlastPlacedTileID[1]);
	var lastPlacedTileColumn = parseInt(splitlastPlacedTileID[3]);

	// perform the loop to find the hex information by targetting the row and column information
	for (let i = 0; i < mapData.length; i++) {
		if(mapData[i][0].row == lastPlacedTileRow) {
			for (let j = 0; j < mapData[i].length; j++) {
				if(mapData[i][j].column == lastPlacedTileColumn) {
					// once the row and column match (which signifies that the correct tile is being targetted), reset all of the tile information
					mapData[i][j].placedTile = false;
					mapData[i][j].placedToken = false;
					mapData[i][j].rotation = 0;
					mapData[i][j].habitats = [];
					mapData[i][j].wildlife = [];
				}
			}
		}
	}

	if($('.tokenTileContainer.chosenTokenTileContainer').length) {
		// NON-NATURE TOKEN CODE

		// move the last placed tile from the map hex where it currently is back to the display area from where it originated
		$('.mapTileContainer.lastPlacedTile .tileContainer').parentToAnimate($('.tokenTileContainer.chosenTokenTileContainer'), 1000);

		// this condition is met if the user has clicked on a token ready to place it on a valid map hex AND THEN CLICKED THE UNDO LAST TILE PLACEMENT BUTTON
		if($('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .activeToken').length) {

			// Create the standard default token image and insert it into the current chosen token container
			$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer').append('<img class="token" src="img/tokens/' + currentChosenWildlife + '.png">');

			// Fade out the active token image (which we already knows exists based on this if statement condition being met) and at the same time fade in the newly created standard default token image
			$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .activeToken').fadeOut();
			$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .token').fadeIn();

			// remove the wildlife classes and attributes from the valid map hex tiles
			$('.wildlifeTokenPotential').removeAttr('wildlifetokenpotentialtype');
			$('.wildlifeTokenPotential').removeClass('wildlifeTokenPotential');

			setTimeout(function(){
				//now that enough time has elapsed remove the activeToken that's previously been hidden
				$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .activeToken').remove();
				// reset the currentChosenWildlife variable
				currentChosenWildlife = '';
			}, 400)

		}

		// again give the player the option to clear duplicates (if there are any and they haven't already taken advantage of this functionality this turn)
		checkDuplicateTokens();

		setTimeout(function(){
			// remove the .chosenTokenTileContainer and the .inactive classes ready for the player to choose a different tile+token combination
			$('.tokenTileContainer.chosenTokenTileContainer').removeClass('chosenTokenTileContainer');
			$('.inactive').removeClass('inactive');

			// remove the .lastPlacedTile since there are now no last placed tiles this turn
			$('.lastPlacedTile').removeClass('lastPlacedTile');

			// generateMap();
		
			// run the function to activate the Nature Token button again (if there are any to use)
			// the true reactivates the button
			updateNatureCubesNum(true);

			$('#' + lastPlacedTileID).removeClass('placedTile');

			if(!$('#' + lastPlacedTileID + ' .tileOutline').length) {
				$('#' + lastPlacedTileID).html('<img class="tileOutline" src="img/tileOutline.png">');
			}

		}, 500)

	} else if($('.tokenTileContainer.potentialNatureCube').length) {
		// NATURE TOKEN CODE

		// move the last placed tile from the map hex where it currently is back to the display area from where it originated
		$('.mapTileContainer.lastPlacedTile .tileContainer').parentToAnimate($('.tokenTileContainer.chosenNatureCubeTileParent'), 1000);

		// Again the code checks to see if another token has previously been chosen - if it has the below code is actioned in order to remove the appropraite elements and classes
		if($('.tokenTileContainer.potentialNatureCube.natureCubeToken .tokenContainer .activeToken').length) {
			// Create the standard default token image and insert it into the current chosen token container
			$('.tokenTileContainer.chosenNatureCubeTokenParent .tokenContainer').append('<img class="token" src="img/tokens/' + currentChosenWildlife + '.png">');

			// Fade out the active token image (which we already knows exists based on this if statement condition being met) and at the same time fade in the newly created standard default token image
			$('.tokenTileContainer.chosenNatureCubeTokenParent .tokenContainer .activeToken').fadeOut();
			$('.tokenTileContainer.chosenNatureCubeTokenParent .tokenContainer .token').fadeIn();

			// remove the wildlife classes and attributes from the valid map hex tiles
			$('.wildlifeTokenPotential').removeAttr('wildlifetokenpotentialtype');
			$('.wildlifeTokenPotential').removeClass('wildlifeTokenPotential');

			setTimeout(function(){
				//now that enough time has elapsed remove the activeToken that's previously been hidden
				$('.tokenTileContainer.chosenNatureCubeTokenParent .tokenContainer .activeToken').remove();
				// remove the chosenNatureCubeTokenParent class since there now no chosen tile
				$('.chosenNatureCubeTokenParent').removeClass('chosenNatureCubeTokenParent');
				// reset the currentChosenWildlife variable
				currentChosenWildlife = '';
			}, 400)
		}

		setTimeout(function(){
			// remove the .inactive class ready for the player to choose a different tile+token combination
			$('.inactive').removeClass('inactive');

			// the .chosenNatureCubeTileParent class is removed, since after undoing the tile placement - no tile has been selected yet
			$('.chosenNatureCubeTileParent').removeClass('chosenNatureCubeTileParent');

			// remove the .chosenNatureCubeToken JUST IN CASE the user had already selected a token before clicking the Undo Last Tile Placement button
			$('.chosenNatureCubeToken').removeClass('chosenNatureCubeToken');
			
			// add the .natureCubeTile class again, since the player is again picking a tile
			$('.tokenTileContainer').addClass('natureCubeTile');
			// remove the .natureCubeToken class, since the player has gone backwards in the Nature Token process, and again needs to place a tile before re-unlocking the token placement phase again
			$('.natureCubeToken').removeClass('natureCubeToken');

			// remove the .lastPlacedTile since there are now no last placed tiles this turn
			$('.lastPlacedTile').removeClass('lastPlacedTile');
			// generateMap();

			$('#' + lastPlacedTileID).removeClass('placedTile');

			if(!$('#' + lastPlacedTileID + ' .tileOutline').length) {
				$('#' + lastPlacedTileID).html('<img class="tileOutline" src="img/tileOutline.png">');
			}
		}, 500)
	}
}

function updateNatureCubesNum(activateButton){
	// first update the amount of nature cubes on the span which corresponds with number visible on the "Nature Cubes" button
	$('.numNatureCubesInfo').html(natureCubesNum);
	// If there are no Nature Cubes, the button is deactivcated by default
	$('#natureCubesModal .modal-card .modal-card-body #natureTokenAmount .numNatureCubes').html(natureCubesNum);
	if(natureCubesNum == 0) {
		$('.useNatureCube.button').attr('disabled', 'disabled');
	} else if(activateButton) {
		// If there are Nature Cubes, the button is activcated
		$('.useNatureCube.button').removeAttr('disabled');
	} else if(!activateButton) {
		// Deactivate the button
		$('.useNatureCube.button').attr('disabled', 'disabled');
	}
}

function removeSoloTilesTokens(){

	if(turnsLeft == 1) {
		endOfGameNotification();
	} else {
		// Now the next turn is soon to start, the .chosenTokenTileContainer class can be removed ready for the next turn to start
		$('.chosenTokenTileContainer').removeClass('chosenTokenTileContainer');
		
		// create variables to store the chosen tile and token that the solo AI will be removing
		var chosenTile;
		var chosenToken;

		// var reverseTileTokenOrder = [3, 2, 1, 0];
		// since the solo AI will be taking whatever the bottom-most tile is remaining, we loop through the reverseTileTokenOrder variable until we get a match to find out what bottom-most tile still exists in order to remove it
		for (let i = 0; i < reverseTileTokenOrder.length; i++) {
			// working our way up from the bottom, if the tile doesn't exist (the human player has already chosen it) the code simply works it's way up to the next available container to perform the same check
			if($('.tokenTileContainer[tokentilenum="' + reverseTileTokenOrder[i] + '"] .tileContainer').length) {
				// once the code identifies the bottom-most tile that exists, it stores it into the chosenTile variable
				chosenTile = reverseTileTokenOrder[i];
				// the code then breaks since we don't want the value in the variable to be overridden
				break;
			}
		}

		// var reverseTileTokenOrder = [3, 2, 1, 0];
		// since the solo AI will be taking whatever the bottom-most token is remaining, we loop through the reverseTileTokenOrder variable until we get a match to find out what bottom-most token still exists in order to remove it
		for (let j = 0; j < reverseTileTokenOrder.length; j++) {
			// working our way up from the bottom, if the token doesn't exist (the human player has already chosen it) the code simply works it's way up to the next available container to perform the same check
			if($('.tokenTileContainer[tokentilenum="' + reverseTileTokenOrder[j] + '"] .tokenContainer .token').length) {
				// once the code identifies the bottom-most token that exists, it stores it into the chosenToken variable
				chosenToken = reverseTileTokenOrder[j];
				// the code then breaks since we don't want the value in the variable to be overridden
				break;
			}
		}

		
	
		// the HTML code for the yeti hand to remove the chosen tile is stored in the yetiTileRemoval variable
		var yetiTileRemoval = `
		<div id="yeti-arm-tile-container" class="yeti-container" removedtilerow="${chosenTile}">
			<img id="removeTileYetiOpenedHand" src="img/open-yeti-hand-tile-removal.png">
			<img id="removeTileYetiClosedHand" src="img/closed-yeti-hand-tile-removal.png">
		</div>`;

		// the HTML code for the yeti hand to remove the chosen token is stored in the yetiTokenRemoval variable
		var yetiTokenRemoval = `
		<div id="yeti-arm-token-container" class="yeti-container" removedtokenrow="${chosenToken}">
			<img id="removeTokenYetiOpenedHand" src="img/open-yeti-hand-token-removal.png">
			<img id="removeTokenYetiClosedHand" src="img/closed-yeti-hand-token-removal.png">
		</div>`;

		// add the two yeti hands to the DOM
		$('#tileTokenContainer').append(yetiTileRemoval);
		$('#tileTokenContainer').append(yetiTokenRemoval);

		// add the takeTile class to the yeti-hand to remove the chosen tile
		setTimeout(function(){
			$('#yeti-arm-tile-container').addClass('takeTile');
		}, 100)

		setTimeout(function(){
			$('.tokenTileContainer[tokentilenum="' + chosenTile + '"] .tileContainer').remove();
			$('#yeti-arm-tile-container').removeClass('takeTile');
			$('#yeti-arm-tile-container #removeTileYetiOpenedHand').hide();
			$('#yeti-arm-tile-container #removeTileYetiClosedHand').show();
		}, 1100)

		setTimeout(function(){
			$('#yeti-arm-token-container').addClass('takeToken');
		}, 1000)

		setTimeout(function(){
			$('.tokenTileContainer[tokentilenum="' + chosenToken + '"] .tokenContainer .token').remove();
			$('#yeti-arm-token-container').removeClass('takeToken');
			$('#yeti-arm-token-container #removeTokenYetiOpenedHand').hide();
			$('#yeti-arm-token-container #removeTokenYetiClosedHand').show();
		}, 2000)

		setTimeout(function(){
			$('.yeti-container').remove();
			pickNewTilesTokens();
		}, 2800)
	}

}

function pickNewTilesTokens() {

	$('.finishedNatureCubePlacement').removeClass('finishedNatureCubePlacement');
	// create arrays to store the left over tiles and tokens (after the human player picking 1 tile and 1 token, and the solo AI picking 1 tile and 1 token, there should always be 2 tiles and 2 tokens left over)
	var leftOverTiles = [];
	var leftOverTokens = [];

	for (let i = 0; i < reverseTileTokenOrder.length; i++) {
		// since the .tileContainer is either moved (human player), or removed from the game (solo AI), checking to see if it exists gives an indication if that particular tile is left over
		if($('.tokenTileContainer[tokentilenum="' + reverseTileTokenOrder[i] + '"] .tileContainer').length) {
			// if it does exists, store the number of which container it corresponds with in the leftOverTiles array
			leftOverTiles.push(reverseTileTokenOrder[i]);
		}
	}

	for (let j = 0; j < reverseTileTokenOrder.length; j++) {
		// since the .token is either moved (human player), or removed from the game (solo AI), checking to see if it exists gives an indication if that particular token is left over
		if($('.tokenTileContainer[tokentilenum="' + reverseTileTokenOrder[j] + '"] .tokenContainer .token').length) {
			// if it does exists, store the number of which container it corresponds with in the leftOverTokens array
			leftOverTokens.push(reverseTileTokenOrder[j]);
		}
	}

	// the -1 and -2 containers have css positioning them offscreen, so that once they are created, the can be seamlessly moved into the correct places to replace the moved down tile+token combinations
	var newTileTokenContainerPositions = [-1, -2];

	// loop through the two values in order to create new tile+token containers with the new tile+token information
	for (let k = 0; k < newTileTokenContainerPositions.length; k++) {

		// target the next tile information in the allTiles array
		// splicing the first item removes it from the array and transfers the information into the "thisTile" variable
		var thisTile = allTiles.splice(0, 1);

		// if the new tile has a dual habitat, apply a random rotation to mix it up (otherwise all tiles would come out with the straight line down the middle of them....BORING!!!!)
		if(thisTile[0].habitats.length == 2) {
			// update the rotation value with a random figure
			thisTile[0].rotation = randomRotation();
		}
		
		// splice the next token info, and transfer it into the "thisToken" variable
		var thisToken = allTokens.splice(0, 1);

		// displayedTokens[currentTileTokenContainer] = thisToken[0];

		// generate the tile and token html
		var nextTokenTileHTML = '<div class="tokenTileContainer" tokentilenum="' + newTileTokenContainerPositions[k] + '">';
		nextTokenTileHTML+= generateDisplayTile(thisTile[0]);
		nextTokenTileHTML+= '<div class="tokenContainer" wildlifetoken="' + thisToken[0] + '">';
		nextTokenTileHTML+= '<img class="token" src="img/tokens/' + thisToken[0] + '.png" />';
		nextTokenTileHTML+= '</div>';
		nextTokenTileHTML+= '</div>';
		// add the newly created tile+token container into the same container with the rest of them
		// because of the attributes assigned to these container, they will generate off screen initially
		$('#tileTokenContainer').append(nextTokenTileHTML);
	}

	// the tiles that are left over are pushed down into the bottom two slots
	$('.tokenTileContainer[tokentilenum="' + leftOverTiles[0] + '"] .tileContainer').addClass('movingElementOpacity');
	$('.tokenTileContainer[tokentilenum="' + leftOverTiles[0] + '"] .tileContainer').parentToAnimate($('.tokenTileContainer[tokentilenum="3"]'), 1000);
	$('.tokenTileContainer[tokentilenum="' + leftOverTiles[1] + '"] .tileContainer').addClass('movingElementOpacity');
	$('.tokenTileContainer[tokentilenum="' + leftOverTiles[1] + '"] .tileContainer').parentToAnimate($('.tokenTileContainer[tokentilenum="2"]'), 1000);

	// the new tiles that are generated offscreen are pushed down from offscreen into the top two slots
	$('.tokenTileContainer[tokentilenum="-1"] .tileContainer').addClass('movingElementOpacity');
	$('.tokenTileContainer[tokentilenum="-1"] .tileContainer').parentToAnimate($('.tokenTileContainer[tokentilenum="1"]'), 1000);
	$('.tokenTileContainer[tokentilenum="-2"] .tileContainer').addClass('movingElementOpacity');
	$('.tokenTileContainer[tokentilenum="-2"] .tileContainer').parentToAnimate($('.tokenTileContainer[tokentilenum="0"]'), 1000);

	// the new tiles that are generated offscreen are pushed down from offscreen into the top two slots
	// at the same time, the wildlifetoken attribute is updated on the tokenContainer to reflect the new wildlifetoken that has just been moved into it
	$('.tokenTileContainer[tokentilenum="' + leftOverTokens[0] + '"] .tokenContainer .token').addClass('movingElementOpacity');
	$('.tokenTileContainer[tokentilenum="' + leftOverTokens[0] + '"] .tokenContainer .token').parentToAnimate($('.tokenTileContainer[tokentilenum="3"] .tokenContainer'), 1000);
	$('.tokenTileContainer[tokentilenum="3"] .tokenContainer').attr('wildlifetoken', $('.tokenTileContainer[tokentilenum="' + leftOverTokens[0] + '"] .tokenContainer').attr('wildlifetoken'));
	$('.tokenTileContainer[tokentilenum="' + leftOverTokens[1] + '"] .tokenContainer .token').addClass('movingElementOpacity');
	$('.tokenTileContainer[tokentilenum="' + leftOverTokens[1] + '"] .tokenContainer .token').parentToAnimate($('.tokenTileContainer[tokentilenum="2"] .tokenContainer'), 1000);
	$('.tokenTileContainer[tokentilenum="2"] .tokenContainer').attr('wildlifetoken', $('.tokenTileContainer[tokentilenum="' + leftOverTokens[1] + '"] .tokenContainer').attr('wildlifetoken'));

	// the new tokens that are generated offscreen are pushed down from offscreen into the top two slots
	// at the same time, the wildlifetoken attribute is updated on the tokenContainer to reflect the new wildlifetoken that has just been moved into it
	$('.tokenTileContainer[tokentilenum="-1"] .tokenContainer .token').addClass('movingElementOpacity');
	$('.tokenTileContainer[tokentilenum="-1"] .tokenContainer .token').parentToAnimate($('.tokenTileContainer[tokentilenum="1"] .tokenContainer'), 1000);
	$('.tokenTileContainer[tokentilenum="1"] .tokenContainer').attr('wildlifetoken', $('.tokenTileContainer[tokentilenum="-1"] .tokenContainer').attr('wildlifetoken'));
	$('.tokenTileContainer[tokentilenum="-2"] .tokenContainer .token').addClass('movingElementOpacity');
	$('.tokenTileContainer[tokentilenum="-2"] .tokenContainer .token').parentToAnimate($('.tokenTileContainer[tokentilenum="0"] .tokenContainer'), 1000);
	$('.tokenTileContainer[tokentilenum="0"] .tokenContainer').attr('wildlifetoken', $('.tokenTileContainer[tokentilenum="-2"] .tokenContainer').attr('wildlifetoken'));

	setTimeout(function(){
		// because enough time has elapsed in order for all of the tiles and tokens to move to the new correct containers, the temporary containers to hold the new tile and token information can be deleted
		$('.tokenTileContainer[tokentilenum="-1"]').remove();
		$('.tokenTileContainer[tokentilenum="-2"]').remove();

		// remove the class that enforced .75 opacity for the animation stage
		$('.movingElementOpacity').removeClass('movingElementOpacity');	
		
		// since there is no active wildlife now, reset the global variable
		currentChosenWildlife = '';

		// the "updateNatureCubesNum()" function is run again JUST IN CASE the the last placed token wasnt on a keystone tile
		// basically, this allows the nature cube button to be activated again for the next turn
		// the true signifies that the button can be deactivate if there are Nature Tokens to be able to be used
		updateNatureCubesNum(true);
		// The nature cube associated buttons (Confirm + Cancel) that are currently shown in the placed tile options box are hidden again
		$('.nonNatureCubeButton').show();
		// The Non-nature cube associated buttons that are currently hidden in the placed tile options box are shown again
		$('.natureCubeButton').hide();
		$('.natureCubeMode').removeClass('natureCubeMode');

		// now that the player has concluded their turn, update the turn figure by running the updateNextTurn() function
		updateNextTurn('nextTurn');

		// remove the .inactive classes in preparation for the next turn
		$('.inactive').removeClass('inactive');
		// being a new turn now we can reset the duplicatesClearedThisTurn variable
		duplicatesClearedThisTurn = false;
		// Need to give enough time for the new tokens and tiles to be generated and to slide down
		checkDuplicateTokens();
		
	}, 1000)
}

// this function is triggered at the start of the game to choose the amount of tiles to use (once they're all used the game is over)
function setupTiles(amount) {
	// first all of the tiles are shuffled
	let shuffledTiles = shuffle(tiles);
	// the amoount of tiles stipulated for a one player game (44) is spliced and transferred into the "allTiles" variable in order to use during the game
	allTiles = shuffledTiles.splice(0, amount)
}

	// this function is triggered at the start of the game to generate all of the available tokens in the game

	// var tokenNums = {
	// 	bear: 20,
	// 	salmon: 20,
	// 	hawk: 20,
	// 	elk: 20,
	// 	fox: 20
	// };

function setupTokens() {
	for (var tokenNum in tokenNums) {
		if (tokenNums.hasOwnProperty(tokenNum)) {
			// for the number assigned to each wildlife, the below loop will occur that many times and push that wildlife token into the "allTokens" variable each time
			for (let i = 0; i < tokenNums[tokenNum]; i++) {
				allTokens.push(tokenNum);
			}
		}
	}
	// all the tokens are now shuffled and then stored in the "allTokens" to be used during the game
	allTokens = shuffle(allTokens);
}

function setupGoalTileThumbnails() {
	for (let i = 0; i < wildlife.length; i++) {
		$('#goalsContainer').append('');
		$('#scoringGoalsContainer').append('');
		$('#' + wildlife[i] + 'ScoringModal .modal-card-body').html('');
	}
}

function setupInitialTokensAndTiles() {
	// since there are 4 tiles to be generated, the below loop is actioned 4 times
	for (let i = 0; i < 4; i++) {
		// the first tile is spliced and stored in the "thisTile" variable
		var thisTile = allTiles.splice(0, 1);
		// if there are multiple habitats on the tile, choose a random rotation in order to display the tile
		if(thisTile[0].habitats.length == 2) {
			thisTile[0].rotation = randomRotation();
		}
		// finally push the tile information into the "initialTiles" variable which will eventually hold the information for all 4 initial tiles to be displayed
		initialTiles.push(thisTile[0]);
	}

	// since there are 4 tokens to be generated, the below loop is actioned 4 times
	for (let j = 0; j < 4; j++) {
		// the first token is spliced and stored in the "thisToken" variable
		var thisToken = allTokens.splice(0, 1);
		// finally push the token information into the "initialTokens" variable which will eventually hold the information for all 4 initial tokens to be displayed
		initialTokens.push(thisToken[0]);
	}

	var initialTokenTileHTML = '';

	// again, since there are 4 combinations of tiles+tokens container, the below loop is actioned 4 times
	for (let k = 0; k < 4; k++) {
		// the below code generates the HTML to store information for each tile and token combination and then inserts it into the DOM
		initialTokenTileHTML+= '<div class="tokenTileContainer" tokenTileNum="' + k + '">';
		initialTokenTileHTML+= generateDisplayTile(initialTiles[k]);
		initialTokenTileHTML+= '<div class="tokenContainer" wildlifetoken="' + initialTokens[k] + '">';
		initialTokenTileHTML+= '<img class="token" src="img/tokens/' + initialTokens[k] + '.png" />';
		initialTokenTileHTML+= '</div>';
		initialTokenTileHTML+= '</div>';
	}

	$('#tileTokenContainer').append(initialTokenTileHTML);

	checkDuplicateTokens();

}

function checkDuplicateTokens() {

	// THIS CODE ONLY CHECKS TO SEE IF THERE IS A SCENARIO THAT WILL MEAN THAT 4 DUPLICATED TOKENS WILL BE REPLACED OR IF THERE IS 3 DUPLICATED TOKENS - IT WILL ONLY ACTIVATE THE REMOVE DUPLICATES BUTTON

	// disable the "replaceDuplicateTokens" button
	$('#replaceDuplicateTokens').attr('disabled', 'disabled');

	// the global variable "displayedTokens" is reset
	displayedTokens = [];

	// each ".tokenTileContainer" is looped through in order to glean the token information and store them into the "displayedTokens" variable
	$('.tokenTileContainer').each(function(){
		displayedTokens.push($(this).find('.tokenContainer').attr('wildlifetoken'));
	})

	// applying the Set call eliminates all duplicates in the "displayedTokens" variable
	let uniqueTokens = [...new Set(displayedTokens)];

	// if the length of the "uniqueTokens" array is 1, it means ALL of the tokens were duplicates, since there was no other variations to remain behind
	// therefore, the below code activates if ALL 4 TOKENS ARE THE SAME
	if(uniqueTokens.length == 1) {
		// the rules dictate that if all 4 tokens are the same, they are to be cleared and replenished with 4 more tokens, no questions asked, and this IS NOT OPTIONAL - IT HAS TO HAPPEN
		// the modal thaty explains this rule is now activated
		$('#allDuplicateTokensModal').addClass('is-active');
		// the ".duplicateWildlifeText" span in the explanation is updated to hold the actual wildlife name of the token that is duplicated 4 times
		$('.duplicateWildlifeText').html(uniqueTokens[0]);
		// similarly, the duplicated token image is also inserted into the instructions
		var duplicateImgContainer = '<img class="duplicateTokenExample" src="img/tokens/' + uniqueTokens[0] + 'Inactive.png" />';
		$('#allDuplicateTokensModal .modal-content .notification #duplicateImgContainer').html(duplicateImgContainer);

	} else if(uniqueTokens.length == 2) {
		// if this condition is met, it means there's possibly 3 of the same token present in the displayed tokens area
		// example 'bear', 'bear', 'fox', 'bear'
		// once the new Set is applied becomes:
		// ['bear', 'fox']
		// however, the token configuration could also be:
		// 'bear', 'fox', 'fox', 'bear'
		// which would give the same result, so we need to find out the exact make-up of the displayed tokens

		// find out how many of each of the two displayed wildlife types are actually present in the displayed area
		var firstToken = countInArray(displayedTokens, uniqueTokens[0]);
		var secondToken = countInArray(displayedTokens, uniqueTokens[1]);

		// create the "duplicatedToken" and set it to false
		var duplicatedToken = false;

		// check to see (if any) which wildlife type is present 3 times in the displayed area
		if(firstToken == 3) {
			duplicatedToken = uniqueTokens[0];
		} else if(secondToken == 3) {
			duplicatedToken = uniqueTokens[1];
		}

		
		if(duplicatedToken && !duplicatesClearedThisTurn) {
			$('#replaceDuplicateTokens').removeAttr('disabled');
		}
	}
}

function removeDuplicateTokens(duplicateAmount) {

	// deactive the "replaceDuplicateTokens" button
	$('#replaceDuplicateTokens').attr('disabled', 'disabled');

	// if there are 4 duplicates, the below code is activate (which will replace the 4 tokens in question - no questions asked)
	if(duplicateAmount == 4) {
		// while the re3moving duplicates process is happening, deactivate all of the tokenTile containers to avoide the human player interfering
		$('.tokenTileContainer').addClass('inactive');

		// instantly add the inactive version of the duplicated token to each tokenContainer, as well as a red cross (remember: these are hidden by default)

		let currentToken = 0;

		$('.tokenContainer').each(function(){
			$(this).append('<img class="duplicateToken" src="img/tokens/' + displayedTokens[currentToken] + 'Inactive.png" />');
			$(this).append('<img class="redCross" src="img/cross.png" />');
			currentToken++;
		})

		// now we take turns moving down the indexes of the token containers to fade in the inactive state of the duplicated token, as well as the associated red cross
		$('.tokenTileContainer[tokentilenum="0"] .tokenContainer .duplicateToken').fadeIn();
		$('.tokenTileContainer[tokentilenum="0"] .tokenContainer .redCross').fadeIn();

		setTimeout(function(){
			// now we take turns moving down the indexes of the token containers to fade in the inactive state of the duplicated token, as well as the associated red cross
			$('.tokenTileContainer[tokentilenum="1"] .tokenContainer .duplicateToken').fadeIn();
			$('.tokenTileContainer[tokentilenum="1"] .tokenContainer .redCross').fadeIn();
		}, 400);

		setTimeout(function(){
			// now we take turns moving down the indexes of the token containers to fade in the inactive state of the duplicated token, as well as the associated red cross
			$('.tokenTileContainer[tokentilenum="2"] .tokenContainer .duplicateToken').fadeIn();
			$('.tokenTileContainer[tokentilenum="2"] .tokenContainer .redCross').fadeIn();
		}, 800);

		setTimeout(function(){
			// now we take turns moving down the indexes of the token containers to fade in the inactive state of the duplicated token, as well as the associated red cross
			$('.tokenTileContainer[tokentilenum="3"] .tokenContainer .duplicateToken').fadeIn();
			$('.tokenTileContainer[tokentilenum="3"] .tokenContainer .redCross').fadeIn();
		}, 1200);

		setTimeout(function(){
			// now that enough time has elapsed in order to show the inactive version of the duplicated token in each of the 4 displayed container, as well as the associated red cross, all of the inactive tokens can be removed as well as the associated red crosses
			$('.tokenTileContainer .tokenContainer .token').remove();
			$('.tokenTileContainer .tokenContainer .duplicateToken').fadeOut();
			$('.tokenTileContainer .tokenContainer .redCross').fadeOut();

		}, 1600);

		setTimeout(function(){
			// now that enought ime has elapsed to hide all of the duplicated tokens and the red crosses, they are now removed
			$('.tokenTileContainer .tokenContainer .duplicateToken').remove();
			$('.tokenTileContainer .tokenContainer .redCross').remove();

			// the code now picks 4 new tokens, and at the same time, pushes the replaced ones to the back of the "allTokens" array 
			for (let j = 0; j < 4; j++) {
				// transfer the first token in the "allTokens" array into the "newToken" variable
				let newToken = allTokens.splice(0, 1);
				// at the same time transfer the first token in the "displayedTokens" array into the "oldToken" variable
				let oldToken = displayedTokens.splice(0, 1);
				// push the NEW token to the end of the "displayedTokens" variable (by the time this happens four times, the first token that was pushed will end at index [0])
				displayedTokens.push(newToken[0]);
				// push the OLD token to the end of the "allTokens" variable
				allTokens.push(oldToken[0])
			}
			
			// now that the replaced tokens have been pushed to the end of the "allTokens" variable, we now shuffle the entire array to distribute them throughout the other tokens that are remaining
			allTokens = shuffle(allTokens);

			// once all 4 new tokens have been picked, we now loop through them, generate the HTML, and the update the displayed container with the relevant information of the new tokens
			for (let k = 0; k < displayedTokens.length; k++) {
				$('.tokenTileContainer[tokentilenum="'+ k + '"] .tokenContainer ').append('<img class="replacedToken" src="img/tokens/' + displayedTokens[k] + '.png" />');
				$('.tokenTileContainer[tokentilenum="'+ k + '"] .tokenContainer').attr('wildlifetoken', displayedTokens[k]);
			}

			// all the newly replaced tokens have the temporary class of ".replacedToken", which is now targeted to fade in all of the new tokens at once
			$('.tokenTileContainer .tokenContainer .replacedToken').fadeIn();
			
		}, 2000);

		setTimeout(function(){
			// now that enough time has elapsed for the new tokens to fade in, we can remove the temporary class and assign the normal ".token" class to them now
			$('.replacedToken').addClass('token').removeClass('replacedToken');
			// the .inactive class is now removed to allow the player to choose one of the tile+token combinations
			$('.tokenTileContainer.inactive').removeClass('inactive');
			// there is the risk that more duplicates will be generated, so the checkDuplicateTokens(); function is run again
			checkDuplicateTokens();
			updateNatureCubesNum(true);
		}, 2400);
	} else if(duplicateAmount == 3) {

		// in case the user has already clicked a tile and token combination to start the process to place it - undo all of the active states
		deactivateChosenTile();

		// the rules stipulate that 3 duplicates can only be cleared ONCE per turn, so the "duplicatesClearedThisTurn" is set to true to stop the user clearing duplicates multiple times (if the scenario presented itself)
		duplicatesClearedThisTurn = true;

		// add the .inactive to each container so that the player can't interfere while the code is being actioned
		$('.tokenTileContainer').addClass('inactive');

		// identify which tokens are unique
		var uniqueTokens = [...new Set(displayedTokens)];

		// store the two different wildlife types into two variables
		var firstToken = countInArray(displayedTokens, uniqueTokens[0]);
		var secondToken = countInArray(displayedTokens, uniqueTokens[1]);

		var duplicatedToken = false;

		// find out which wildlife type has the confirmed 3 duplicates
		if(firstToken == 3) {
			duplicatedToken = uniqueTokens[0];
		} else if(secondToken == 3) {
			duplicatedToken = uniqueTokens[1];
		}

		// create the "matchedTokensIndexes" array to store the specific indexes of the containers that hold the duplicated tokens
		var matchedTokensIndexes = [];

		// loop through the token containers whose "wildlifetoken" attribute match the duplicated wildlife type, then target the parent container to find the index of that container, and store it in the previously created "matchedTokensIndexes" array
		$('.tokenContainer[wildlifetoken="' + duplicatedToken + '"]').each(function(){
			matchedTokensIndexes.push($(this).closest('.tokenTileContainer').attr('tokentilenum'));
		})

		// sort the matched indexes numerically so that the tokens will be replaced periodically in order
		matchedTokensIndexes.sort();

		// for each of the containers that contain the duplicate token, create inactive image of that matched wildlife type, as well as a red cross, and insert it into each of the containers
		$('.tokenContainer[wildlifetoken="' + duplicatedToken + '"]').append('<img class="duplicateToken" src="img/tokens/' + duplicatedToken + 'Inactive.png" />');
		$('.tokenContainer[wildlifetoken="' + duplicatedToken + '"]').append('<img class="redCross" src="img/cross.png" />');

		// take turns consecutively fading in each inactive image and red cross of the 3 duplicated tokens (token 1 / 3)
		$('.tokenContainer .duplicateToken').eq(0).fadeIn();
		$('.tokenContainer .redCross').eq(0).fadeIn();

		// take turns consecutively fading in each inactive image and red cross of the 3 duplicated tokens (token 2 / 3)
		setTimeout(function(){
			$('.tokenContainer .duplicateToken').eq(1).fadeIn();
			$('.tokenContainer .redCross').eq(1).fadeIn();
		}, 400);

		// take turns consecutively fading in each inactive image and red cross of the 3 duplicated tokens (token 3 / 3)
		setTimeout(function(){
			$('.tokenContainer .duplicateToken').eq(2).fadeIn();
			$('.tokenContainer .redCross').eq(2).fadeIn();
		}, 800);

		
		setTimeout(function(){
			// now that enough time has elapsed, removed the previously hidden tokens
			$('.tokenTileContainer[tokentilenum="' + matchedTokensIndexes[0] + '"] .tokenContainer .token').remove();
			$('.tokenTileContainer[tokentilenum="' + matchedTokensIndexes[1] + '"] .tokenContainer .token').remove();
			$('.tokenTileContainer[tokentilenum="' + matchedTokensIndexes[2] + '"] .tokenContainer .token').remove();

			// start to fade out the now showing inactive states of each token as well as the associated red cross in each container
			$('.tokenTileContainer .tokenContainer .duplicateToken').fadeOut();
			$('.tokenTileContainer .tokenContainer .redCross').fadeOut();
		}, 1200);

		setTimeout(function(){
			// now that enough time has elapsed, the ".duplicateToken" and ".redCross" images are removed from the HTML
			$('.tokenTileContainer .tokenContainer .duplicateToken').remove();
			$('.tokenTileContainer .tokenContainer .redCross').remove();

			// matchedTokensIndexes = [0, 2, 3]
			// target each push the duplicated tokens to the back of the "allTokens" array
			let firstToken = displayedTokens[matchedTokensIndexes[0]];
			allTokens.push(firstToken)

			let secondToken = displayedTokens[matchedTokensIndexes[1]];
			allTokens.push(secondToken)

			let thirdToken = displayedTokens[matchedTokensIndexes[2]];
			allTokens.push(thirdToken)

			for (let j = 0; j < 3; j++) {
				// splice the first token in the "allTokens" array to be the chosen newToken
				let newToken = allTokens.splice(0, 1);
				// the code now uses the previously matched indexes for the duplicated tokens to override the values in the "displayedTokens" variable withe the new token information, in order to maintain the exact line-up of the current displayed tokens
				displayedTokens[matchedTokensIndexes[j]] = newToken[0];
			}

			for (let k = 0; k < matchedTokensIndexes.length; k++) {
				// each token container has the wildlife information updated to reflect the newly chosen token, and then has the default image of the newly chosen token inserted into the token container
				$('.tokenTileContainer[tokentilenum="'+ matchedTokensIndexes[k] + '"] .tokenContainer').attr('wildlifetoken', displayedTokens[matchedTokensIndexes[k]]);
				$('.tokenTileContainer[tokentilenum="'+ matchedTokensIndexes[k] + '"] .tokenContainer').append('<img class="replacedToken" src="img/tokens/' + displayedTokens[matchedTokensIndexes[k]] + '.png" />');
			}
			// the newly chosen tokens are faded in
			$('.tokenTileContainer .tokenContainer .replacedToken').fadeIn();
			// all of the tokens (included the replaced duplicates) are now shuffled
			allTokens = shuffle(allTokens);
		}, 1600);

		setTimeout(function(){
			// the temporary ".replacedToken" class is removed and replaced with the default ".token" class
			$('.replacedToken').addClass('token').removeClass('replacedToken');
			// all of the ".inactive" classes are removed ready for the next turn
			$('.tokenTileContainer.inactive').removeClass('inactive');
			// in case more duplicates are generated, run the function again
			checkDuplicateTokens();
			updateNatureCubesNum(true);
		}, 2000);

	}
}

function removeNatureCubeChosenTokens() {
	var tokensToReplaceIndexes = [];
	var tokensToReplaceWildlife = [];

	for (let i = 0; i < 4; i++) {
		if($('.tokenTileContainer[tokentilenum="' + i + '"] .tokenContainer.confirmedTokenToClear').length) {
			tokensToReplaceIndexes.push(i);
			tokensToReplaceWildlife.push($('.tokenTileContainer[tokentilenum="' + i + '"] .tokenContainer').attr('wildlifetoken'));
		}
	}

	for (let j = 0; j < tokensToReplaceIndexes.length; j++) {
			// for each of the containers that contain the duplicate token, create inactive image of that matched wildlife type, as well as a red cross, and insert it into each of the containers
			$('.tokenTileContainer[tokentilenum="' + tokensToReplaceIndexes[j] + '"] .tokenContainer').append('<img class="duplicateToken" src="img/tokens/' + tokensToReplaceWildlife[j] + 'Inactive.png" />');
			$('.tokenTileContainer[tokentilenum="' + tokensToReplaceIndexes[j] + '"] .tokenContainer').append('<img class="redCross" src="img/cross.png" />');
	}

	var timeDelayPerToken = [];

	for (let k = 0; k < tokensToReplaceIndexes.length + 3; k++) {
		timeDelayPerToken.push(k * 400);
	}

	for (let l = 0; l < tokensToReplaceIndexes.length; l++) {
		setTimeout(function(){
			$('.tokenContainer .duplicateToken').eq(l).fadeIn();
			$('.tokenContainer .redCross').eq(l).fadeIn();
			$('.tokenContainer .activeToken').eq(l).fadeOut();
		}, timeDelayPerToken[l])
	}

	setTimeout(function(){
		// now that enough time has elapsed, removed the previously hidden tokens
		$('.tokenTileContainer .tokenContainer .activeToken').remove();
		// start to fade out the now showing inactive states of each token as well as the associated red cross in each container
		$('.tokenTileContainer .tokenContainer .duplicateToken').fadeOut();
		$('.tokenTileContainer .tokenContainer .redCross').fadeOut();
	}, timeDelayPerToken[parseInt(timeDelayPerToken.length) - 3]);

	setTimeout(function(){
		// now that enough time has elapsed, the ".duplicateToken" and ".redCross" images are removed from the HTML
		$('.tokenTileContainer .tokenContainer .duplicateToken').remove();
		$('.tokenTileContainer .tokenContainer .redCross').remove();

		for (let m = 0; m < tokensToReplaceWildlife.length; m++) {
			allTokens.push(tokensToReplaceWildlife[m])
		}

		for (let n = 0; n < tokensToReplaceIndexes.length; n++) {
			// splice the first token in the "allTokens" array to be the chosen newToken
			let newToken = allTokens.splice(0, 1);
			// the code now uses the previously matched indexes for the duplicated tokens to override the values in the "displayedTokens" variable withe the new token information, in order to maintain the exact line-up of the current displayed tokens
			displayedTokens[tokensToReplaceIndexes[n]] = newToken[0];
		}

		for (let p = 0; p < tokensToReplaceIndexes.length; p++) {
			// each token container has the wildlife information updated to reflect the newly chosen token, and then has the default image of the newly chosen token inserted into the token container
			$('.tokenTileContainer[tokentilenum="'+ tokensToReplaceIndexes[p] + '"] .tokenContainer').attr('wildlifetoken', displayedTokens[tokensToReplaceIndexes[p]]);
			$('.tokenTileContainer[tokentilenum="'+ tokensToReplaceIndexes[p] + '"] .tokenContainer').append('<img class="replacedToken" src="img/tokens/' + displayedTokens[tokensToReplaceIndexes[p]] + '.png" />');
		}
		// the newly chosen tokens are faded in
		$('.tokenTileContainer .tokenContainer .replacedToken').fadeIn();
		// all of the tokens (included the replaced duplicates) are now shuffled
		allTokens = shuffle(allTokens);
	}, timeDelayPerToken[parseInt(timeDelayPerToken.length) - 2])	

	setTimeout(function(){
		// the temporary ".replacedToken" class is removed and replaced with the default ".token" class
		$('.replacedToken').addClass('token').removeClass('replacedToken');

		$('.confirmedTokenToClear').removeClass('confirmedTokenToClear');
		// all of the ".inactive" classes are removed ready for the next turn
		$('.tokenTileContainer.inactive').removeClass('inactive');
		// in case more duplicates are generated, run the function again
		checkDuplicateTokens();

		updateNatureCubesNum(true);

		$('#confirmClearSelectedTokens').remove();
		$('#selectAllTokensToClear').remove();

	}, timeDelayPerToken[parseInt(timeDelayPerToken.length) - 1])	

}

function randomRotation() {
	var rotations = [0, 60, 120, 180, 240, 300];
	var rotationIndex = Math.floor(Math.random() * 6);
	return rotations[rotationIndex];
}

function generateDisplayTile(thisTile) {
	var displayTileHTML = '<div class="tileContainer" '
	
	// store the habitat(s) info in a attribute on the parent container to allow for easy processing of information
	if(thisTile.habitats.length == 1) {
		displayTileHTML+= 'habitats="' + thisTile.habitats[0] + '" ';
	} else if(thisTile.habitats.length == 2) {
		displayTileHTML+= 'habitats="' + thisTile.habitats[0] + ' ' + thisTile.habitats[1] + '" ';
	}

	displayTileHTML+= 'wildlife="';

	// store the wildlife(s) info in a attribute on the parent container to allow for easy processing of information
	for (let j = 0; j < thisTile.wildlife.length; j++) {
		if(j < thisTile.wildlife.length - 1) {
			displayTileHTML += thisTile.wildlife[j] + ' ';
		} else {
			displayTileHTML += thisTile.wildlife[j];
		}
		
	}
	
	displayTileHTML += '" tilewildlife="' + thisTile.wildlife.length + '" tilerotation="' + thisTile.rotation + '">'


	// generate the actual tile image, based on the habitat(s)
	if(thisTile.habitats.length == 1) {
		displayTileHTML+= '<img class="habitatTile" src="img/tiles/' + thisTile.habitats[0] + '.png" />';
	} else if(thisTile.habitats.length == 2) {
		displayTileHTML+= '<img class="habitatTile" src="img/tiles/' + thisTile.habitats[0] + '+' + thisTile.habitats[1] + '.png" style="transform: rotate(' + thisTile.rotation + 'deg);" />';
	}

	for (let i = 0; i < thisTile.wildlife.length; i++) {
		displayTileHTML+= '<img class="tileToken wildlifeToken-' + (i + 1) + '" src="img/tokens/' + thisTile.wildlife[i] + '.png" />';
	}

	displayTileHTML+= '</div>';

	// return the HTML so that whenever the function is called, will now be a placeholder for the above HTML
	return displayTileHTML;
}

let mapLoopLimit = 0;

function initiateMap() {

	let numRows = mapLimits.down - mapLimits.up + 1;
	let numColumns = mapLimits.right - mapLimits.left + 1;

	// mapData = []
	let i;
	let j;
	let k;
	let l;

	// loop through all rows
	for (i = 0, j = mapLimits.up; i < numRows; i++) {

		mapRowsColumnsIndexes.rows['row' + j] = i;

		// j = 16 ROW START
		// i < 11 ROW DURATION (11 rows)
		// end result = rows = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
		mapData[i] = [];
		// loop through all the children of the currently targetted row - which represents the columns
		for (k = 0, l = mapLimits.left; k < numColumns; k++) {

			mapRowsColumnsIndexes.columns['column' + l] = k;

			// l = 14 COLUMNS START
			// k < 12 COLUMNS DURATION (12 columns)
			// end result = columns = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
			mapData[i][k] = {
				// every map hex is blank to start with
				row: j,
				column: l,
				placedTile: false,
				habitats: [],
				wildlife: [],
				placedToken: false,
				rotation: 0
			}
			l++;
		}
		j++;
	}

	// there are 5 starting tiles - randomly choose one
	var startingTileNum = Math.floor(Math.random() * 5);
	// run the code to transfer the starting tile information into the map
	loadStartingTileDetails(startingTileNum)
	// now that the starting template for the map has been creatd (as well as the starting tile information), the map is generated
	generateMap();
}

function loadStartingTileDetails(startingTile){
	// : "bear"
	let startingMapHexIDs = ['row-20-column-20', 'row-21-column-19', 'row-21-column-20']
	let startingMapHexRows = [];
	let startingMapHexColumns = [];

	for (let i = 0; i < startingMapHexIDs.length; i++) {
		var splitStartingTileID = startingMapHexIDs[i].split('-');
		startingMapHexRows.push(parseInt(splitStartingTileID[1]));
		startingMapHexColumns.push(parseInt(splitStartingTileID[3]));
	}

	for (let i = 0; i < 3; i++) {

		let mapRowIndex = mapRowsColumnsIndexes['rows']['row' + startingMapHexRows[i]];
		let mapColumnIndex = mapRowsColumnsIndexes['columns']['column' + startingMapHexColumns[i]];

		mapData[mapRowIndex][mapColumnIndex].placedTile = true;
		mapData[mapRowIndex][mapColumnIndex].habitats = startingTiles[startingTile][i].habitats;
		mapData[mapRowIndex][mapColumnIndex].wildlife = startingTiles[startingTile][i].wildlife;
		mapData[mapRowIndex][mapColumnIndex].rotation = startingTiles[startingTile][i].rotation;
	}

}

function generateMap() {
	// the map HTML script
	var mapHTML = '<div id="mapHiddenOverlay">';
	for (let i = 0; i < mapData.length; i++) {
		for (let j = 0; j < mapData[i].length; j++) {

			mapHTML += '<div id="row-' + mapData[i][j].row + '-column-' + mapData[i][j].column + '" class="mapTileContainer row-' + mapData[i][j].row + ' column-' + mapData[i][j].column;

			if(mapData[i][j].placedToken) {
				mapHTML += ' placedToken';
			}

			if(mapData[i][j].placedTile) {
				mapHTML +=  ' placedTile">';

				mapHTML += '<div class="tileContainer" '
	
				if(mapData[i][j].habitats.length == 1) {``
					mapHTML+= 'habitats="' + mapData[i][j].habitats[0] + '" ';
				} else if(mapData[i][j].habitats.length == 2) {
					mapHTML+= 'habitats="' + mapData[i][j].habitats[0] + ' ' + mapData[i][j].habitats[1] + '" ';
				}

				if(!mapData[i][j].placedToken) {

					mapHTML+= 'wildlife="';

					for (let k = 0; k < mapData[i][j].wildlife.length; k++) {
						if(k < mapData[i][j].wildlife.length - 1) {
							mapHTML += mapData[i][j].wildlife[k] + ' ';
						} else {
							mapHTML += mapData[i][j].wildlife[k];
						}
					}
				}
				
				mapHTML += '" tilewildlife="' + mapData[i][j].wildlife.length + '" tilerotation="' + mapData[i][j].rotation + '">'

				if(mapData[i][j].habitats.length == 1) {
					mapHTML +=  '<img class="habitatTile" src="img/tiles/' + mapData[i][j].habitats + '.png" style="transform: rotate(' + mapData[i][j].rotation + 'deg);">';
				} else {
					mapHTML +=  '<img class="habitatTile" src="img/tiles/' + mapData[i][j].habitats[0] + '+' + mapData[i][j].habitats[1] + '.png" style="transform: rotate(' + mapData[i][j].rotation + 'deg);">';
				}

				if(!mapData[i][j].placedToken) {

					for (let k = 0; k < mapData[i][j].wildlife.length; k++) {
						mapHTML +=  '<img class="tileToken wildlifeToken-' + (k + 1) + '" src="img/tokens/' + mapData[i][j].wildlife[k] + '.png">';
					}
				}

				mapHTML +=  '</div>';

			} else {
				mapHTML +=  '">';
				mapHTML += '<img class="tileOutline" src="img/tileOutline.png" />';
			}

			if(mapData[i][j].placedToken) {
				mapHTML += '<img class="placedWildlifeToken" src="img/tokens/' + mapData[i][j].placedToken + 'Active.png" />';
			}

			mapHTML += '</div>';

		}
	}
	mapHTML += '</div>';

	mapHTML += '<div class="zoomOptions">';

	mapHTML += '<img zoomType="zoomIn" class="zoomIn zoomOption inactiveZoom" src="img/zoomIn-inactive.png" />';
	mapHTML += '<img zoomType="zoomOut" class="zoomOut zoomOption activeZoom" src="img/zoomOut.png" />';

	mapHTML += '</div>';

	mapHTML += '<div class="mapNavigation">';

	mapHTML += '<img class="navBackground" src="img/woodCircle.png" />';

	mapHTML += '<img direction="up" class="upArrow navArrow" src="img/arrow.png" />';
	mapHTML += '<img direction="right" class="rightArrow navArrow" src="img/arrow.png" />';
	mapHTML += '<img direction="down" class="downArrow navArrow" src="img/arrow.png" />';
	mapHTML += '<img direction="left" class="leftArrow navArrow" src="img/arrow.png" />';

	mapHTML += '</div>';

	mapHTML += '<div id="placedTileOptions">';

	mapHTML += '<button id="cancelTilePlacement" class="button is-danger nonNatureCubeButton">Cancel</button>';
	mapHTML += '<button id="confirmTilePlacement" class="button is-success nonNatureCubeButton">Confirm</button>';
	mapHTML += '<button id="cancelNatureCubeTilePlacement" class="button is-danger natureCubeButton">Cancel</button>';
	mapHTML += '<button id="confirmNatureCubeTilePlacement" class="button is-success natureCubeButton">Confirm</button>';
	mapHTML += '<button id="rotateTileCounterclockwise" class="button is-link">Rotate Counterclockwise</button>';
	mapHTML += '<button id="rotateTileClockwise" class="button is-primary">Rotate Clockwise</button>';
	
	mapHTML += '</div>';

	// the map is generated and all the exisiting information has been replaced
	$('#gameLayer #mapContainer').html(mapHTML);

	if($('.tokenTileContainer.potentialNatureCube').length) {
		$('.nonNatureCubeButton').hide();
		$('.natureCubeButton').show();
		$('.mobileTilePlacementOptions .mobileTilePlacementOption').addClass('natureCubeMode');
	}
	$('.navArrow').show();

}

function showPossibleTilePlacements(mode) {

	// initiate an array to store all of the potentialTile placements into
	var potentialTiles = [];

	// since you need to place a new tile next to an existing tile, the code first of all loops through all of the currently placed tiles out on the board
	$('.mapTileContainer.placedTile').each(function(index) {
		// store the current id of the placedTile in question
		let thisID = $(this).attr('id');
		// run the "neighbourTiles" function to find out which tiles are next to the currently selected already placed tile, and store them in the "potentialPlacements" array
		let potentialPlacements = neighbourTiles(thisID);

		// loop through the "potentialPlacements" to see if any of the neighbourTiles ALREADY HAVE A TILE ON IT
		for (let i = 0; i < potentialPlacements.length; i++) {
			// Only neighbour tiles WITHOUT the "placedTile" class meet the criteria to be pushed into the "potentialTiles" array
			if(!$('#' + potentialPlacements[i]).hasClass('placedTile')) {
				potentialTiles.push(potentialPlacements[i]);
			}
		}
		
	});

	// we apply a new Set to the array of potential tiles, since most (if not all) of the placed tiles border the same empty tiles, so this eliminates duplicates
	var confirmedTiles = [...new Set(potentialTiles)];

	// for the final confirmed map hexes that are valid potential placement, loop through them to add the relevant class (depending on the game mode) that will be used to preview the potential token placements
	for (let i = 0; i < confirmedTiles.length; i++) {
		if(mode == 'normal') {
			$('#' + confirmedTiles[i]).addClass('potentialPlacement');
		} else if(mode == 'natureCube') {
			$('#' + confirmedTiles[i]).addClass('potentialNatureCubeTilePlacement');
		}
		// finally, add the opaque yellow hex to each of the potential map hexes for the player to easily see which hexes can receive the tile that is currently chosen
		$('#' + confirmedTiles[i]).append('<img class="validPlacement" src="img/potentialPlacement.png" />');
	}

}

function neighbourTiles(tileID) {
	
	$('.validPlacement').remove();
	$('.potentialPlacement').removeClass('potentialPlacement');
	let splitID = tileID.split('-');
	let thisRow = parseInt(splitID[1]);
	let thisColumn = parseInt(splitID[3]);

	var potentialPlacements = [];

	if(thisRow % 2 == 0) {
		potentialPlacements.push('row-' + (thisRow - 1)  + '-column-' + (thisColumn - 1));
		potentialPlacements.push('row-' + (thisRow - 1)  + '-column-' + (thisColumn));
		potentialPlacements.push('row-' + (thisRow)  + '-column-' + (thisColumn + 1));
		potentialPlacements.push('row-' + (thisRow + 1)  + '-column-' + (thisColumn));
		potentialPlacements.push('row-' + (thisRow + 1)  + '-column-' + (thisColumn - 1));
		potentialPlacements.push('row-' + (thisRow)  + '-column-' + (thisColumn - 1));
	} else {
		potentialPlacements.push('row-' + (thisRow - 1)  + '-column-' + (thisColumn));
		potentialPlacements.push('row-' + (thisRow - 1)  + '-column-' + (thisColumn + 1));
		potentialPlacements.push('row-' + (thisRow)  + '-column-' + (thisColumn + 1));
		potentialPlacements.push('row-' + (thisRow + 1)  + '-column-' + (thisColumn + 1));
		potentialPlacements.push('row-' + (thisRow + 1)  + '-column-' + (thisColumn));
		potentialPlacements.push('row-' + (thisRow)  + '-column-' + (thisColumn - 1));
	}
	return potentialPlacements;
}

function updateNextTurn(mode){
	// starting variable: var turnsLeft = 21;

	if(mode != 'setup') {
		// the function runs when the player succesfully concludes a turn, the turnsLeft variable figure is always reduced by one
		turnsLeft--;
	}

	// then the new turnsLeft figure is updated in the Turns Left info on the page
	$('.turnsLeftFigure').html(turnsLeft);

	// if the turnsLeft variable is at 0, the game is over, and the red color indicates this to the player
	if(turnsLeft == 0) {
		$('#turnsAndNatureTokenContainer').addClass('has-text-danger');
		$('#mobileTurnsAndNatureTokenContainer').addClass('has-text-danger');
	}
}

function activateTokenPlacement(mode) {

	if(mode == 'normalToken') {
		// TOKEN CODE STARTS!!!!!!!!!!

		// since a nature cube IS NOT BEING USED we can now target the token that is contained in the previously chosen tilke+token combination container that the tile previously came from
		currentChosenWildlife = $('.tokenTileContainer.chosenTokenTileContainer .tokenContainer').attr('wildlifetoken');

		// the active token image (with a green border) is added into the token container. By default it is hidden
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer').append('<img class="activeToken" src="img/tokens/' + currentChosenWildlife + 'Active.png" />')

		// the active token image fades in
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .activeToken').fadeIn();

		// at the same time, the standard token image fades out
		$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .token').fadeOut();

		// the showOptions class is removed from the #placedTileOptions element, since we've finished manipulating the newly placed tile
		$('#placedTileOptions').removeClass('showOptions');

		$('.mobileTilePlacementOptions.activeTileOptions').addClass('inactiveTileOptions').removeClass('activeTileOptions');

		// the yellow border around the newly placed tile can also be faded out, since we've finished the tile placement process and are now moving on to the token placement
		$('.selectedTileOutline').fadeOut();

		// the run the activateTokenPlacement() which identifies which tiles on the map are able to receive the currently chosen token and adds a class for when the user hovers over them to show that they're a valid placement for the currently chosen token
		activateTokenPlacement();

		setTimeout(function(){
			// now that enough time has elapsed to fade out the relveant elements, we can remove them from the DOM
			$('.tokenTileContainer.chosenTokenTileContainer .tokenContainer .token').remove();
			$('.selectedTileOutline').remove();
		}, 400)
	}

	// create the thisWildlifeNum variable in order to check whether there are any valid placements for the currently chosen token
	var validTokenPlacements = false;

	// loop through every map hex that has a placed tile BUT DOES NOT HAVE A PLACED TOKEN
	$('.mapTileContainer.placedTile:not(.placedToken) .tileContainer').each(function(index) {

		// store all of the associated wildlife types for each placed tile into a variable
		let thisTilesWildlife = $(this).attr('wildlife');
		// split the stored information by blank spaces (if there's multiple wildlife types they'll have a space between each of them)
		let thisWildlifeSplit = thisTilesWildlife.split(' ');

		// check to see if any of the wildlife types associated with each tile match the currently chosen token
		if(thisWildlifeSplit.indexOf(currentChosenWildlife) !== -1) {
			// if a placed tile allows the currently chosen token to be placed onto it, it is given the .wildlifeTokenPotential class 
			$(this).parent().addClass('wildlifeTokenPotential');
			// since there are some tiles that can take multiple tokens, the specific wildlife type that is currently being placed is assigned to the map hex
			$(this).parent().attr('wildlifeTokenPotentialType', currentChosenWildlife);
			// since there is a match, the "validTokenPlacements" variable is set to true
			validTokenPlacements = true;
		}
	});

	// if the thisWildlifeNum remains false, it means there were no map hexes that matched with the currently chosen token - therefore the "remove token" modal is now activated to give the players either the choice of bailing to pick another tile+token combination, or to continue in order to remove the token from the game
	if(!validTokenPlacements) {
		if($('.tokenTileContainer.chosenTokenTileContainer').length) {
			// this condition is met if the player is currently carrying out a normal token placement (NOT NATURE CUBE)

			$('#noValidPlacementModal').addClass('is-active');
			$('#noValidPlacementModal .modal-content .notification .invalidWildlifeText').html(currentChosenWildlife);
			$('#noValidPlacementModal .modal-content .notification .invalidTokenImg').html('<img class="removedToken" src="img/tokens/' + currentChosenWildlife + 'Inactive.png" alt=""><img class="removeTokenRedCross" src="img/cross.png" />');
	
		} else if($('.tokenTileContainer.potentialNatureCube').length) {
			// this condition is met if the player is currently carrying out a NATURE CUBE token placement 
			$('#noValidPlacementNatureCubeModal').addClass('is-active');
			$('#noValidPlacementNatureCubeModal .modal-content .notification .invalidWildlifeText').html(currentChosenWildlife);
			$('#noValidPlacementNatureCubeModal .modal-content .notification .invalidTokenImg').html('<img class="removedToken" src="img/tokens/' + currentChosenWildlife + 'Inactive.png" alt=""><img class="removeTokenRedCross" src="img/cross.png" />');
	
		}
	}
}

function endOfGameNotification() {
	// run this function once the human player places all of their 21 tiles
	// remove the displayed tiles and tokens area (since we don't need them anymore)
	updateNextTurn('nextTurn');
	$('#lastTurnModal').addClass('is-active');

}

function endOfGameSetup() {
	$('body').fadeOut();

	setTimeout(function(){

		$('body').addClass('gameOver');

		$('.tokenTileContainer').remove();
		$('#allButtonsContainer').remove();
		$('#goalsContainer').remove();
		$('#tileTokenContainer').addClass('finalScoring');

		$("#mapContainer #mapHiddenOverlay .mapTileContainer .tileToken").remove();
		
		$('#allEndGameScoringCategories').show();

		// $('#mainCascadiaTitle').hide();
		// $('#mobileCascadiaTitle').hide();
		// $('#endGameCascadiaTitle').show();

		var scoringTableHTML = `
		<div id="scoringTable-finalScoringContainer" class="finalScoringItem inactiveScoringItem">
				<img class="scoringTableImage" src="img/scoring/full-scoring-table.jpg" alt="" />

				<table id="wildlifeScoringTable" cellpadding="0" cellspacing="0" class="finalScoringTable">
					<tbody>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="natureTokensScoringInput" category="wildlife-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="bear-wildlifeScoringInput" category="wildlife-Cell"></p>	
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="elk-wildlifeScoringInput" category="wildlife-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="fox-wildlifeScoringInput" category="wildlife-Cell"></p>	
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="hawk-wildlifeScoringInput" category="wildlife-Cell"></p>	
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="salmon-wildlifeScoringInput" category="wildlife-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="subtotalCell">
								<p class="subtotalText" id="wildlife-Subtotal"></p>
							</td>
						</tr>
					</tbody>
				</table>

				<table id="habitatScoringTable" cellpadding="0" cellspacing="0" class="finalScoringTable">
					<tbody>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="mountain-habitatScoringInput" category="habitat-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="forest-habitatScoringInput" category="habitat-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="desert-habitatScoringInput" category="habitat-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="swamp-habitatScoringInput" category="habitat-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="lake-habitatScoringInput" category="habitat-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="subtotalCell">
								<p class="subtotalText" id="habitat-Subtotal"></p>
							</td>
						</tr>
					</tbody>
				</table>

				<table id="habitatBonusScoringTable" cellpadding="0" cellspacing="0" class="finalScoringTable">
					<tbody>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="mountainBonus-habitatScoringInput" category="habitatBonus-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="forestBonus-habitatScoringInput" category="habitatBonus-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="desertBonus-habitatScoringInput" category="habitatBonus-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="swampBonus-habitatScoringInput" category="habitatBonus-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="scoreCell">
								<p class="scoreCellText scoringInput dataFromText" id="lakeBonus-habitatScoringInput" category="habitatBonus-Cell"></p>
							</td>
						</tr>
						<tr>		
							<td class="subtotalCell">
								<p class="subtotalText" id="habitatBonus-Subtotal"></p>
							</td>
						</tr>
					</tbody>
				</table>
				<p id="finalScore">Final score: <span class="has-text-weight-bold"><span id="scoreVal">0</span> points</span></p>
			</div>

			<div id="bear-finalScoringContainer" class="largeWildlifeFinalScoringInfo finalScoringItem inactiveScoringItem">
				<img src="img/scoring-goals/bear-large.jpg" alt="" />
				
				<div class="individualWildlifeScoringInputContainer">								
					<img class="individualWildlifeScore-background" src="img/scoring/bearScore.jpg" alt="" />
					<img class="individualWildlifeScore-mobileBackground" src="img/scoring/bearScoreMobile.jpg" alt="" />
					<p class="individualScoringInput" id="bear-individualWildlifeScoringInput" category="individualWildlife-Cell"><span class="individualPointsNum">0</span> point<span class="pluralPoints">s</span></p>	
				</div>

			</div>

			<div id="elk-finalScoringContainer" class="largeWildlifeFinalScoringInfo finalScoringItem inactiveScoringItem">
				<img src="img/scoring-goals/elk-large.jpg" alt="" />

				<div class="individualWildlifeScoringInputContainer">								
					<img class="individualWildlifeScore-background" src="img/scoring/elkScore.jpg" alt="" />
					<img class="individualWildlifeScore-mobileBackground" src="img/scoring/elkScoreMobile.jpg" alt="" />
					<p class="individualScoringInput" id="elk-individualWildlifeScoringInput" category="individualWildlife-Cell"><span class="individualPointsNum">0</span> point<span class="pluralPoints">s</span></p>	
				</div>

			</div>

			<div id="fox-finalScoringContainer" class="largeWildlifeFinalScoringInfo finalScoringItem inactiveScoringItem">
				<img src="img/scoring-goals/fox-large.jpg" alt="" />
				
				<div class="individualWildlifeScoringInputContainer">								
					<img class="individualWildlifeScore-background" src="img/scoring/foxScore.jpg" alt="" />
					<img class="individualWildlifeScore-mobileBackground" src="img/scoring/foxScoreMobile.jpg" alt="" />
					<p class="individualScoringInput" id="fox-individualWildlifeScoringInput" category="individualWildlife-Cell"><span class="individualPointsNum">0</span> point<span class="pluralPoints">s</span></p>	
				</div>

			</div>

			<div id="hawk-finalScoringContainer" class="largeWildlifeFinalScoringInfo finalScoringItem inactiveScoringItem">
				<img src="img/scoring-goals/hawk-large.jpg" alt="" />
				
				<div class="individualWildlifeScoringInputContainer">								
					<img class="individualWildlifeScore-background" src="img/scoring/hawkScore.jpg" alt="" />
					<img class="individualWildlifeScore-mobileBackground" src="img/scoring/hawkScoreMobile.jpg" alt="" />
					<p class="individualScoringInput" id="hawk-individualWildlifeScoringInput" category="individualWildlife-Cell"><span class="individualPointsNum">0</span> point<span class="pluralPoints">s</span></p>	
				</div>

			</div>

			<div id="salmon-finalScoringContainer" class="largeWildlifeFinalScoringInfo finalScoringItem inactiveScoringItem">
				<img src="img/scoring-goals/salmon-large.jpg" alt="" />
				
				<div class="individualWildlifeScoringInputContainer">								
					<img class="individualWildlifeScore-background" src="img/scoring/salmonScore.jpg" alt="" />
					<img class="individualWildlifeScore-mobileBackground" src="img/scoring/salmonScoreMobile.jpg" alt="" />
					<p class="individualScoringInput" id="salmon-individualWildlifeScoringInput" category="individualWildlife-Cell"><span class="individualPointsNum">0</span> point<span class="pluralPoints">s</span></p>	
				</div>

			</div>
		`;

		$('#tileTokenContainer').html(scoringTableHTML);

	}, 400)

	setTimeout(function(){
		setupFinalScoring();

		$('#scoringTable-FinalScoringModalTrigger').removeClass('activeScoringItemTrigger').addClass('inactiveScoringItemTrigger');
		$('#scoringTable-FinalScoringModalTrigger').prepend('<img class="activeScoringFrame" src="img/scoringGoal-active.png" />');
		$('#scoringTable-FinalScoringModalTrigger .activeScoringFrame').css('display', 'block');

		$('#scoringTable-mobileFinalScoringModalTrigger').removeClass('mobileActiveScoringItemTrigger').addClass('mobileInactiveScoringItemTrigger');
		$('#scoringTable-mobileFinalScoringModalTrigger').prepend('<img class="mobileActiveScoringFrame" src="img/mobileScoringGoal-active.png" />');
		$('#scoringTable-mobileFinalScoringModalTrigger .mobileActiveScoringFrame').css('display', 'block');

		$('#tileTokenContainer.finalScoring #scoringTable-finalScoringContainer').removeClass('inactiveScoringItem').addClass('activeScoringItem');
		$('body').fadeIn('slow');
	}, 600)

}

function debugShowTileIDs(){
	$('.mapTileContainer.placedTile').each(function(){
		if($(this).hasClass('placedToken')) {
			let currentTileID = $(this).attr('id');
			let splitCurrentTileID = currentTileID.split('-');
	
			let thisRow = parseInt(splitCurrentTileID[1]);
			let thisColumn = parseInt(splitCurrentTileID[3]);
	
			$(this).append(`<p class="debugTileCoords">${thisRow}-${thisColumn}</p>`);
		} else {
			$(this).remove();
		}
	})

	$('body.gameOver #mapContainer').css({
		'height': '70vw',
		'width': '97vw',
		'position': 'absolute',
		'top': '0vw',
		'left': '0vw',
		'z-index': '99'
	})

	$('body.gameOver #mapContainer #mapHiddenOverlay').css({
		'top': '0px',
		'left': '420px',
	})

}


$(document).on('mouseover','.finalScoringItemTrigger:not(.lockTrigger).activeScoringItemTrigger .goalScoringTransparentLayer',function(){
	$('.hoverScoringFrame').remove();
	$(this).after('<img class="hoverScoringFrame" src="img/scoringGoal-hover.png" />');
	$('.hoverScoringFrame').css('display', 'block');
});

$(document).on('mouseout','.finalScoringItemTrigger:not(.lockTrigger).activeScoringItemTrigger .goalScoringTransparentLayer',function(){
	$('.hoverScoringFrame').remove();
});

$(document).on(touchEvent,'.finalScoringItemTrigger:not(.lockTrigger).activeScoringItemTrigger .goalScoringTransparentLayer',function(){

	$('.animated.pulse').removeClass('animated pulse');

	let parentID = $(this).parent().attr('id');

	$('.finalScoringItemTrigger').addClass('lockTrigger');

	$('.hoverScoringFrame').remove();
	$('.activeScoringFrame').fadeOut('fast');

	setTimeout(function(){
		$('.activeScoringFrame').remove();
		$('#' + parentID).prepend('<img class="activeScoringFrame" src="img/scoringGoal-active.png" />')
	}, 200)

	$('.inactiveScoringItemTrigger').removeClass('inactiveScoringItemTrigger').addClass('activeScoringItemTrigger');
	$('.activeScoringItem').removeClass('activeScoringItem').addClass('inactiveScoringItem');

	$('#' + parentID).addClass('inactiveScoringItemTrigger').removeClass('activeScoringItemTrigger')
	

	let thisID = parentID.split('-');

	setTimeout(function(){
		$('#' + thisID[0] + '-finalScoringContainer').removeClass('inactiveScoringItem').addClass('activeScoringItem');
		$('.lockTrigger').removeClass('lockTrigger');

		if(parentID != 'scoringTable') {
			if($('.placedWildlifeToken[wildlife=' + thisID[0] + ']').length) {
				$('.placedWildlifeToken[wildlife=' + thisID[0] + ']').addClass('animated pulse')
			}
		}
		$('.activeScoringFrame').fadeIn('slow');
	}, 400)

});


$(document).on('mouseover','.mobileFinalScoringItemTrigger:not(.lockTrigger).mobileActiveScoringItemTrigger .mobileGoalScoringTransparentLayer',function(){
	$('.mobileHoverScoringFrame').remove();
	
	$(this).after('<img class="mobileHoverScoringFrame" src="img/mobileScoringGoal-hover.png" />');
	$('.mobileHoverScoringFrame').css('display', 'block');
});

$(document).on('mouseout','.mobileFinalScoringItemTrigger:not(.lockTrigger).mobileActiveScoringItemTrigger .mobileGoalScoringTransparentLayer',function(){
	$('.mobileHoverScoringFrame').remove();
});

$(document).on(touchEvent,'.mobileFinalScoringItemTrigger:not(.lockTrigger).mobileActiveScoringItemTrigger .mobileGoalScoringTransparentLayer',function(){

	$('.animated.pulse').removeClass('animated pulse');

	let parentID = $(this).parent().attr('id');

	$('.mobileFinalScoringItemTrigger').addClass('lockTrigger');

	$('.mobileHoverScoringFrame').remove();
	$('.mobileActiveScoringFrame').fadeOut('fast');

	setTimeout(function(){
		$('.mobileActiveScoringFrame').remove();
		$('#' + parentID).prepend('<img class="mobileActiveScoringFrame" src="img/mobileScoringGoal-active.png" />')
	}, 200)

	$('.mobileInactiveScoringItemTrigger').removeClass('mobileInactiveScoringItemTrigger').addClass('mobileActiveScoringItemTrigger');
	$('.activeScoringItem').removeClass('activeScoringItem').addClass('inactiveScoringItem');

	$('#' + parentID).addClass('mobileInactiveScoringItemTrigger').removeClass('mobileActiveScoringItemTrigger')

	let thisID = parentID.split('-');

	setTimeout(function(){
		$('#' + thisID[0] + '-finalScoringContainer').removeClass('inactiveScoringItem').addClass('activeScoringItem');
		$('.lockTrigger').removeClass('lockTrigger');

		if(parentID != 'scoringTable') {
			if($('.placedWildlifeToken[wildlife=' + thisID[0] + ']').length) {
				$('.placedWildlifeToken[wildlife=' + thisID[0] + ']').addClass('animated pulse')
			}
		}
		$('.mobileActiveScoringFrame').fadeIn('slow');
	}, 400)

});

let lastCell = '';
let currentCell = '';

$(document).on(touchEvent,'.finalScoringTable .scoreCell .scoringInput',function(){
	if(lastCell == '') {
		lastCell = $(this).attr('id');
	} else {
		currentCell = $(this).attr('id');

		if(lastCell != currentCell) {
			lastCell = currentCell;
			checkForBlanks();
		}
	}
})

function updateAllSubtotals() {

	let tables = ['wildlifeScoringTable', 'habitatScoringTable', 'habitatBonusScoringTable'];
	let categories = ['wildlife', 'habitat', 'habitatBonus'];
	let fullCategoryName = ['wildlife-Cell', 'habitat-Cell', 'habitatBonus-Cell'];

	for (let i = 0; i < tables.length; i++) {
		let thisSubTotal = 0;
		$('#' + tables[i] + ' .scoreCell .scoringInput[category="' + fullCategoryName[i] + '"]').each(function(){

			if($(this).hasClass('dataFromInput')) {
				if($(this).val() != '') {
					thisSubTotal = thisSubTotal + parseInt($(this).val());
				}
			} else if($(this).hasClass('dataFromText')) {
				if($(this).html() != '-') {
					let removeBonusPlusSymbols = $(this).html().replace('+', '');
					thisSubTotal = thisSubTotal + parseInt($(this).html());
				}
			}
		});
	
		$('.subtotalCell #' + categories[i] + '-Subtotal').html(thisSubTotal);
	}

	updateTotalScore();
}


function updateSubtotal(tableID, category) {

	let subTotalID = category.split('-');
	let subTotal = 0;

	$('#' + tableID + ' .scoreCell .scoringInput[category="' + category + '"]').each(function(){
		if($(this).val() != '' && $(this).hasClass('dataFromInput')) {
			subTotal = subTotal + parseInt($(this).val());
		} else if($(this).hasClass('dataFromText')) {
			if($(this).html() != '-') {
				subTotal = subTotal + parseInt($(this).html());
			}
		}
	});

	$('.subtotalCell #' + subTotalID[0] + '-Subtotal').html(subTotal);

	updateTotalScore();
}

function updateTotalScore() {

	let totalScore = 0;

	$('.subtotalCell .subtotalText').each(function(){
		if($(this).html() != '-') {
			totalScore = totalScore + parseInt($(this).html());
		}
	});

	$('#finalScore #scoreVal').html(totalScore);
}

function checkForBlanks() {

	$('#scoringTable-finalScoringContainer .finalScoringTable .scoreCell .scoringInput').each(function(){
		if($(this).hasClass('dataFromInput')) {
			if($(this).val() == '') $(this).val('0');
		} else if($(this).hasClass('dataFromText')) {
			if($(this).html() == '') {
				if($(this).attr('category') == 'habitatBonus-Cell') {
					$(this).html('-');
				} else {
					$(this).html('0');
				}
			}
		}
	});

	$('.largeWildlifeFinalScoringInfo.finalScoringItem .individualWildlifeScoringInputContainer .individualScoringInput .individualPointsNum').each(function(){
		if($(this).html() == '') $(this).html('0');
	});
}


function setupFinalScoring() {

	$('#natureTokensScoringInput').html(natureCubesNum);

	$('#mapHiddenOverlay .mapTileContainer .placedWildlifeToken').each(function(){
		let tokenWildlife = $(this).attr('wildlife');
		$(this).attr('src', `img/tokens/${tokenWildlife}.png`);
	})

	checkForBlanks();
	processPlacedTilesAndTokens();

	calculateBearTokenScoring();
	calculateElkTokenScoring();
	calculateFoxTokenScoring();
	calculateHawkTokenScoring();
	calculateSalmonTokenScoring();

	const allWildlife = Object.keys(tokenScoring);

	for (const currentWildlife of allWildlife) {
		$('#wildlifeScoringTable.finalScoringTable .scoreCell #' + currentWildlife + '-wildlifeScoringInput').html(tokenScoring[currentWildlife].totalScore);

		$('#tileTokenContainer.finalScoring .finalScoringItem #' + currentWildlife + '-individualWildlifeScoringInput .individualPointsNum').html(tokenScoring[currentWildlife].totalScore);
		if(tokenScoring[currentWildlife].totalScore == 1) {
			$('#tileTokenContainer.finalScoring .finalScoringItem #' + currentWildlife + '-individualWildlifeScoringInput .pluralPoints').hide();
		} else {
			$('#tileTokenContainer.finalScoring .finalScoringItem #' + currentWildlife + '-individualWildlifeScoringInput .pluralPoints').show();
		}
		
	}

	updateAllSubtotals();
	
}

var allPlacedTiles = {};
var allPlacedTokens = {};

let habitatMatches = {
	desert: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	},
	forest: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	},
	lake: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	},
	mountain: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	},
	swamp: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	}
};

let rotationIndexes = {
	positive: [0, 60, 120, 180, 240, 300],
	negative: [0, -300, -240, -180, -120, -60]
}

function processRotationFigure(rotation){	
	if(rotation >= 360) {
		rotation = rotation % 360;
	} else if(rotation <= -360) {
		rotation = rotation % -360;
	}	
	return rotation;
}

function findRotationIndex(rotation){
	let rotationIndex = 0;
	if(Math.sign(rotation) != -1) {		
		rotationIndex = rotationIndexes['positive'].indexOf(rotation);		
		return rotationIndex;
	} else {		
		rotationIndex = rotationIndexes['negative'].indexOf(rotation);		
		return rotationIndex;
	}
}

let directions = ['NE', 'E', 'SE', 'SW', 'W', 'NW'];
let oppositeDirections = ['SW', 'W', 'NW', 'NE', 'E', 'SE'];

let linkedTileSides = [
	{	
		rowColMapping: [{
				rowDif: -1,
				colDif: 0
			},{
				rowDif: -1,
				colDif: +1
			}
		],
		direction: 'NE',
		oppositeDirection: 'SW',
		indexMatch: '0-3'
	},{	
		rowColMapping: [{
			rowDif: 0,
			colDif: +1
		},{
			rowDif: 0,
			colDif: +1
		}],
		direction: 'E',
		oppositeDirection: 'W',
		indexMatch: '1-4'
	},{	
		rowColMapping: [{
			rowDif: +1,
			colDif: 0
		},{
			rowDif: +1,
			colDif: +1
		}],
		direction: 'SE',
		oppositeDirection: 'NW',
		indexMatch: '2-5'
	},{	rowColMapping: [{
			rowDif: +1,
			colDif: -1
		},{
			rowDif: +1,
			colDif: 0
		}],
		direction: 'SW',
		oppositeDirection: 'NE',
		indexMatch: '3-0'
	},{	
		rowColMapping: [{
			rowDif: 0,
			colDif: -1
		},{
			rowDif: 0,
			colDif: -1
		}],
		direction: 'W',
		oppositeDirection: 'E',
		indexMatch: '4-1'
	},{	
		rowColMapping: [{
			rowDif: -1,
			colDif: -1
		},
		{
			rowDif: -1,
			colDif: 0
		}],
		direction: 'NW',
		oppositeDirection: 'SE',
		indexMatch: '5-2'
	}
];

function processPlacedTilesAndTokens() {

	let tileNum = 1;
	
	for (let i = 0; i < mapData.length; i++) {
		for (let j = 0; j < mapData[i].length; j++) {
			if(mapData[i][j].placedTile) {
					let thisRow = mapData[i][j].row;
					let thisColumn = mapData[i][j].column;
					let thisRotation = processRotationFigure(parseInt(mapData[i][j].rotation));
					let numTurns = findRotationIndex(thisRotation);
					let thisHabitats = [];
					let thisHabitatSides = new Array(6);
				if(mapData[i][j].habitats.length == 1) {
		
					for (let k = 0; k < thisHabitatSides.length; k++) {
						thisHabitatSides[k] = mapData[i][j].habitats[0];
					}

					habitatMatches[mapData[i][j].habitats[0]].placedTiles++;
					thisHabitats.push(mapData[i][j].habitats[0]);

				} else if(mapData[i][j].habitats.length == 2) {

					// let numTurns = rotationIndexes.indexOf(thisRotation);
					let habitatsLoaded = 0;
					let turnedIndex = habitatsLoaded + numTurns;

					habitatMatches[mapData[i][j].habitats[0]].placedTiles++;
					habitatMatches[mapData[i][j].habitats[1]].placedTiles++;

					thisHabitats.push(mapData[i][j].habitats[1], mapData[i][j].habitats[0]);
					let currentHabitat = thisHabitats[0];
					
					for (let k = 0; k < thisHabitatSides.length; k++) {

						thisHabitatSides[turnedIndex] = currentHabitat;
						
						turnedIndex++
						if(turnedIndex == 6) turnedIndex = 0;

						habitatsLoaded++
						if(habitatsLoaded == 3) currentHabitat = thisHabitats[1];

					}
				}

				allPlacedTiles['row-' + thisRow + '-column-' + thisColumn] = {
					tileNum: tileNum,
					row: thisRow,
					column: thisColumn,
					rotation: thisRotation,
					habitats: thisHabitats,
					habitatSides: thisHabitatSides
				}

				if(mapData[i][j].placedToken) allPlacedTokens['row-' + thisRow + '-column-' + thisColumn] = mapData[i][j].placedToken;
				tileNum++;
			}
		}
	}

	const tileIDs = Object.keys(allPlacedTiles);
			
	for (const tileID of tileIDs) {

		let thisRow = allPlacedTiles[tileID].row
		let thisColumn = allPlacedTiles[tileID].column
		
		let rowColMapSet = thisRow % 2;
		if(rowColMapSet != 0) rowColMapSet = 1;

		for (let i = 0; i < linkedTileSides.length; i++) {

			let newRow = thisRow + linkedTileSides[i].rowColMapping[rowColMapSet].rowDif;
			let newColumn = thisColumn + linkedTileSides[i].rowColMapping[rowColMapSet].colDif;		
			let newTileID = 'row-' + newRow + '-column-' + newColumn;

			if(allPlacedTiles.hasOwnProperty(newTileID)) {
				let matchedIndexes = linkedTileSides[i].indexMatch.split('-');
				if(allPlacedTiles[tileID].habitatSides[matchedIndexes[0]] == allPlacedTiles[newTileID].habitatSides[matchedIndexes[1]]) {
					let thisTileNum = allPlacedTiles[tileID].tileNum;
					let matchedTileNum = allPlacedTiles[newTileID].tileNum;
					habitatMatches[allPlacedTiles[tileID].habitatSides[matchedIndexes[0]]].tilesWithMatchedHabitats.push(thisTileNum + '-' + matchedTileNum);
				}
			}
		}
	}

	let oldHabitatMatches = JSON.parse(JSON.stringify(habitatMatches))
	const allHabitats = Object.keys(habitatMatches);
			
	for (const currentHabitat of allHabitats) {

		if(habitatMatches[currentHabitat].placedTiles > 0) {
			if(habitatMatches[currentHabitat].tilesWithMatchedHabitats.length > 0){

				let linkedTiles = JSON.parse(JSON.stringify(habitatMatches[currentHabitat].tilesWithMatchedHabitats));

				let tileQueue = [];
				let thisTileGroup = [];

				while(linkedTiles.length > 0) {

					tileQueue = [];
					thisTileGroup = [];

					let firstTiles = linkedTiles.pop();
					let splitFirstTiles = firstTiles.split('-');
					let reverseTileMatch = splitFirstTiles[1] + '-' + splitFirstTiles[0];

					let reverseTileIndex = linkedTiles.indexOf(reverseTileMatch);

					if(reverseTileIndex !== -1) {
						let removedTile = linkedTiles.splice(reverseTileIndex, 1);
					}

					tileQueue.push(splitFirstTiles[0], splitFirstTiles[1])

					while(tileQueue.length > 0) {

						for (let k = linkedTiles.length - 1; k >= 0; k--) {
							let tileToCheckString = linkedTiles[k].toString();
							let tileToCheckSplit = tileToCheckString.split('-');
							if(tileQueue[0] == tileToCheckSplit[0]) {
								let matched = linkedTiles.splice(k, 1);
								let matchedString = matched.toString();
								let splitMatched = matchedString.split('-');
								if(tileQueue.indexOf(splitMatched[1]) === -1 && thisTileGroup.indexOf(splitMatched[1]) === -1) {
									tileQueue.push(splitMatched[1]);
								}

							}
						}

						let lastTileChecked = tileQueue.shift();
						thisTileGroup.push(lastTileChecked);
					}

					if(thisTileGroup.length > habitatMatches[currentHabitat].largestSet) {
						habitatMatches[currentHabitat].largestSet = thisTileGroup.length;
					}

					habitatMatches[currentHabitat].finalSets.push(thisTileGroup);

				}
			} else {
				habitatMatches[currentHabitat].largestSet = 1;
			}
		}
	}

	calculateHabitatScoring();

}

function calculateHabitatScoring() {
	const allHabitats = Object.keys(habitatMatches);
			
	for (const currentHabitat of allHabitats) {
		let largestGroupNum = habitatMatches[currentHabitat].largestSet;
		$('#habitatScoringTable.finalScoringTable .scoreCell #' + currentHabitat + '-habitatScoringInput').html(largestGroupNum);
		if(largestGroupNum > 6) {
			$('#habitatBonusScoringTable.finalScoringTable .scoreCell #' + currentHabitat + 'Bonus-habitatScoringInput').html('+2');
		} else {
			$('#habitatBonusScoringTable.finalScoringTable .scoreCell #' + currentHabitat + 'Bonus-habitatScoringInput').html('-');
		}
	}
}

let tokenScoring = {
	bear: {totalScore: 0},
	elk: {totalScore: 0},
	fox: {totalScore: 0},
	hawk: {totalScore: 0},
	salmon: {totalScore: 0}
};

function calculateBearTokenScoring() {

	let bearScoringValues = {
		'1': 4,
		'2': 11,
		'3': 19,
		'4': 27
	}

	let confirmedBearPairs = 0;

	let potentialTokenIDs = [];
	let usedTokenIDs = [];

	const tokenIDs = Object.keys(allPlacedTokens);
			
	for (const tokenID of tokenIDs) {

		potentialTokenIDs = [];

		if(allPlacedTokens[tokenID] == 'bear' && usedTokenIDs.indexOf(tokenID) == -1) {

			let neighbourTiles = neighbourTileIDs(tokenID);

			for (let i = 0; i < neighbourTiles.length; i++) {
				if(allPlacedTokens.hasOwnProperty(neighbourTiles[i])) {
					// The neighbouring tile exists and has a placed token on it!
					// Continue with the specified scoring process for this wildlife'
					if(allPlacedTokens[neighbourTiles[i]] == 'bear') {
						potentialTokenIDs.push(neighbourTiles[i]);
					}
				}
			}

			if(potentialTokenIDs.length == 1) {
				// Only one beighbouring bear means it only has the pair and could qualify for scoring!
				// Need to now make sure there's no bears touching the matched neighbour tile before locking it in for scoring

				let potentialBearPairNeighbourTiles = neighbourTileIDs(potentialTokenIDs[0]);
				for (let i = 0; i < potentialBearPairNeighbourTiles.length; i++) {
					if(allPlacedTokens.hasOwnProperty(potentialBearPairNeighbourTiles[i])) {
						// The neighbouring tile exists and has a placed token on it!
						// Continue with the specified scoring process for this wildlife'
	
						if(allPlacedTokens[potentialBearPairNeighbourTiles[i]] == 'bear') {
							potentialTokenIDs.push(potentialBearPairNeighbourTiles[i]);
						}
					}
				}
				if(potentialTokenIDs.length == 2) {
					if(confirmedBearPairs < 4) confirmedBearPairs++;
				}
			}
			usedTokenIDs.push(...potentialTokenIDs);
		}
	}

	if(confirmedBearPairs != 0) {
		tokenScoring.bear.totalScore = bearScoringValues[confirmedBearPairs];
	}

}

let allElkTokens = [];
let usedElkTokenIDs = [];
let potentialElkLines = [];
let confirmedElkLines = [];

let potentialElkLineStartingTokens = {
	'E': [],
	'SE': [],
	'SW': []
}

let elkScoringValues = {
	'1': 2,
	'2': 5,
	'3': 9,
	'4': 13
}

function calculateElkTokenScoring() {

	const tokenIDs = Object.keys(allPlacedTokens);
	for (const tokenID of tokenIDs) {
		if(allPlacedTokens[tokenID] == 'elk') {
			allElkTokens.push(tokenID);
		}
	}
	

	if(allElkTokens.length != 0) {
		if(allElkTokens.length == 1) {
			usedElkTokenIDs.push(allElkTokens[0]);			
			confirmedElkLines.push(allElkTokens);
		} else {
			generateAllElkLines();
		}
	}

	if(confirmedElkLines.length > 0) {
		confirmedElkLines.sort(function (a, b) {
			return b.length - a.length;
		});

		for (let i = 0; i < confirmedElkLines.length; i++) {		
			
			let elkInLineNum = confirmedElkLines[i].length;
			tokenScoring.elk.totalScore += elkScoringValues[elkInLineNum];
		}
	}
}

let sharedElkTokenIDs = {};
let allLineDetails = {};

function generateAllElkLines(){

	// first remove all elk tokens just by themselves

	for (let i = allElkTokens.length - 1; i >= 0; i--) {

		let neighbouringElk = searchNeighbourTilesForWildlife(allElkTokens[i], 'elk');

		// no neibouring elk means the token is just by itself
		// add it as a separate run and add it's ID to the used tokens pool - also removing it from the allTokens variable
		if(neighbouringElk.length == 0) {			
			confirmedElkLines.push([allElkTokens[i]]);
			usedElkTokenIDs.push(allElkTokens[i]);			
			allElkTokens.splice(i,1);
		}
	}

	for (let i = 0; i < allElkTokens.length; i++) {
		let validStartingLineDirection = []
		validStartingLineDirection = checkValidStartingElkToken(allElkTokens[i]);
		if(validStartingLineDirection.length != 0) {
			for (let j = 0; j < validStartingLineDirection.length; j++) {				
				potentialElkLineStartingTokens[validStartingLineDirection[j]].push(allElkTokens[i]);
			}
		}
	}
		
	const allDirections = Object.keys(potentialElkLineStartingTokens);
	for (const currentDirection of allDirections) {
		for (let i = 0; i < potentialElkLineStartingTokens[currentDirection].length; i++) {
			let currentPotentialElkLine = [];
			currentPotentialElkLine = allElkTokensInLine(potentialElkLineStartingTokens[currentDirection][i], currentDirection);						
			potentialElkLines.push(currentPotentialElkLine);
		}
	}

	potentialElkLines.sort(function (a, b) {
		return b.length - a.length;
	});

	// Now check to see if the potential lines have any shared neighbours or not

	let checkedIndexCombos = [];
	let allSharedElkTokenLineNums = [];

	for (let i = potentialElkLines.length - 1; i >= 0; i--) {
		allLineDetails['line' + (i + 1)] = [...potentialElkLines[i]];
		for (let j = 0; j < potentialElkLines.length; j++) {
			let thisIndexCombo = `${i}-${j}`;
			let altIndexCombo = `${j}-${i}`;
						
			if(checkedIndexCombos.indexOf(thisIndexCombo) == -1 && checkedIndexCombos.indexOf(altIndexCombo) == -1 && i != j) {				
								
				checkedIndexCombos.push(thisIndexCombo);
				let sharedElkTokenDetected = false;
				sharedElkTokenDetected = potentialElkLines[i].some(r=> potentialElkLines[j].indexOf(r) >= 0);
				
				if(sharedElkTokenDetected)  {

					let matchedLineOne = `line${i + 1}`;
					let matchedLineTwo = `line${j + 1}`;

					allSharedElkTokenLineNums.push(matchedLineOne, matchedLineTwo);

					let thisSharedTile = returnDuplicates(potentialElkLines[i], potentialElkLines[j]);

					if(!sharedElkTokenIDs.hasOwnProperty(thisSharedTile)) {
						sharedElkTokenIDs[thisSharedTile] = {
							includedLines: []
						}
					}

					if(sharedElkTokenIDs[thisSharedTile].includedLines.indexOf(matchedLineOne) === -1) {						
						sharedElkTokenIDs[thisSharedTile].includedLines.push(matchedLineOne);
					}

					if(sharedElkTokenIDs[thisSharedTile].includedLines.indexOf(matchedLineTwo) === -1) {						
						sharedElkTokenIDs[thisSharedTile].includedLines.push(matchedLineTwo);
					}
				}
			}
		}
	}

	// let allSharedElkTokenLineNums = [];

	let sharedElkTokenLineNums = allSharedElkTokenLineNums.filter(onlyUnique);
	if(sharedElkTokenLineNums.length == 0) {
		for (let i = 0; i < potentialElkLines.length; i++) {
			processStandaloneElkLine(potentialElkLines[i]);
		}
	} else {

		if(sharedElkTokenLineNums.length != potentialElkLines.length) {
			sharedElkTokenLineNums.sort((a, b) => a - b);
			let sharedTilesLinesCombo = []
			const allLinesNum = Object.keys(allLineDetails);
			for (const thisLineNum of allLinesNum) {
				if(sharedElkTokenLineNums.indexOf(thisLineNum) == -1) {
					processStandaloneElkLine(allLineDetails[thisLineNum]);
					delete allLineDetails[thisLineNum];
				}
			}
		}

		let sharedTilesLinesCombo = []
		const allSharedTiles = Object.keys(sharedElkTokenIDs);
	
		for (const sharedTile of allSharedTiles) {
			let currentArray = [];
			for (let i = 0; i < sharedElkTokenIDs[sharedTile].includedLines.length; i++) {
							
				let sharedElkTokenIDsClone = sharedElkTokenIDs[sharedTile].includedLines.slice();
				sharedElkTokenIDsClone.splice(i,1);
							
				let matchedLinesConvertedToText = '';
				for (let j = 0; j < sharedElkTokenIDsClone.length; j++) {
					matchedLinesConvertedToText += sharedElkTokenIDsClone[j];
					if((j + 1) != sharedElkTokenIDsClone.length) {
						matchedLinesConvertedToText += '-';
					}
				}
				currentArray.push(`${matchedLinesConvertedToText}_${sharedTile}`);
			}
			sharedTilesLinesCombo.push(currentArray);
		}
			
		let allTileCombinations = allPossibleCases(sharedTilesLinesCombo);		
	
		let allPotentialLineCombinations = [];
		let allPotentialLineCombinationsScores = [];
	
		for (let i = 0; i < allTileCombinations.length; i++) {
			let copyOfLines = JSON.parse(JSON.stringify(allLineDetails));
			let thisTileCombination = allTileCombinations[i].split(' ');
			let currentLineCombination = [];
	
			for (let j = 0; j < thisTileCombination.length; j++) {
							
				let splitTileCombination = thisTileCombination[j].split('_');
				let linesToBeExcludedUnsplit = splitTileCombination[0].toString();
				let linesToBeExcluded = linesToBeExcludedUnsplit.split('-');
				let tileToRemove = splitTileCombination[1].toString();
				
				for (let k = 0; k < linesToBeExcluded.length; k++) {
					let thisLine = linesToBeExcluded[k].toString();
					let tileIndex = copyOfLines[thisLine].indexOf(tileToRemove);
								
					copyOfLines[thisLine][tileIndex] = 'undefined';
				}
			}
	
			let currentLineVariations = [];
			const allLines = Object.keys(copyOfLines);
			
			for (const thisLine of allLines) {
		
				let currentLineGroup = [];
				currentLineGroup[0] = [];
	
				for (let k = 0, l = 0; k < copyOfLines[thisLine].length; k++) {
					if(copyOfLines[thisLine][k] != 'undefined') {
						if(currentLineGroup[l].length == 4) {
							l++;
							currentLineGroup[l] = [];
						}
						currentLineGroup[l].push(copyOfLines[thisLine][k]);
					} else {
						if(currentLineGroup[l].length > 0) {
							l++;
							currentLineGroup[l] = [];
						}
					}
				}
	
				if(currentLineGroup.length != 0) {
					for (let l = currentLineGroup.length - 1; l >= 0; l--) {
						if(currentLineGroup[l].length == 0) {
							currentLineGroup.splice(l,1);
						}
					}			
										
					currentLineVariations.push(...currentLineGroup);
				}
			}
	
			let currentLineVariationScore = 0;
	
			for (let m = 0; m < currentLineVariations.length; m++) {
				currentLineVariationScore += elkScoringValues[currentLineVariations[m].length];
			}
	
			allPotentialLineCombinations.push(currentLineVariations);
			allPotentialLineCombinationsScores.push(currentLineVariationScore);
	
		} 
	
		let highestScoreIndex = indexOfMax(allPotentialLineCombinationsScores);
		confirmedElkLines.push(...allPotentialLineCombinations[highestScoreIndex]);

	}
}

function processStandaloneElkLine(thisElkLine) {

	if(thisElkLine.length <= 4) {
		confirmedElkLines.push(thisElkLine);
		usedElkTokenIDs.push(...thisElkLine);
	} else {
		var i,j,temparray,chunk = 4;
		for (i=0,j=thisElkLine.length; i<j; i+=chunk) {
			temparray = thisElkLine.slice(i,i+chunk);
			confirmedElkLines.push(temparray);
			usedElkTokenIDs.push(...temparray);
		}
	}

}

function checkValidStartingElkToken(thisID){
	

	let blankSides = [0, 4, 5];
	let lineCheckSides = [3, 1, 2];

	let validElkLineDirections = [];

	let splitTileID = thisID.split('-');

	let thisRow = parseInt(splitTileID[1]);
	let thisColumn = parseInt(splitTileID[3]);

	let rowColMapSet = thisRow % 2;
	if(rowColMapSet != 0) rowColMapSet = 1;

	for (let i = 0; i < blankSides.length; i++) {

		let thisDirection = linkedTileSides[blankSides[i]].direction;
		let thisOppositeDirection = linkedTileSides[lineCheckSides[i]].direction;

		let precedingRow = thisRow + linkedTileSides[blankSides[i]].rowColMapping[rowColMapSet].rowDif;				
		let precedingColumn = thisColumn + linkedTileSides[blankSides[i]].rowColMapping[rowColMapSet].colDif;				
		let precedingTileID = 'row-' + precedingRow + '-column-' + precedingColumn;

		let followingRow = thisRow + linkedTileSides[lineCheckSides[i]].rowColMapping[rowColMapSet].rowDif;				
		let followingColumn = thisColumn + linkedTileSides[lineCheckSides[i]].rowColMapping[rowColMapSet].colDif;				
		let followingTileID = 'row-' + followingRow + '-column-' + followingColumn;

		let validPrecedingTile = false;
		let validFollowingTile = false;

		if(allPlacedTokens.hasOwnProperty(precedingTileID)) {
			if(allPlacedTokens[precedingTileID] != 'elk') {				
				validPrecedingTile = true;
			}

		} else {
			validPrecedingTile = true;
		}

		if(allPlacedTokens.hasOwnProperty(followingTileID)) {	
			if(allPlacedTokens[followingTileID] == 'elk') {				
				validFollowingTile = true;
			}
		}

		if(validPrecedingTile && validFollowingTile) {			
			validElkLineDirections.push(thisOppositeDirection)
		}

	}
		
	if(validElkLineDirections.length != 0) {
		return validElkLineDirections;
	} else {
		return false;
	}
}

function allElkTokensInLine(startID, thisDirection) {
	

	let matchedLineIDs = [startID];

	let lastTokenID = startID;
	let nextTokenID = '';

	let lineExhausted = false;
	let elkLineLimit = 0;

	while (!lineExhausted) {
		nextTokenID = nextElkTokenInDirection(lastTokenID, thisDirection);		
		if(nextTokenID) {
			matchedLineIDs.push(nextTokenID);
			elkLineLimit++;
			lastTokenID = nextTokenID;
		} else {			
			lineExhausted = true;
		}
	}

	if(matchedLineIDs.length > 0) {
		for (let i = 0; i < matchedLineIDs.length; i++) {
			const element = matchedLineIDs[i];			
		}
	}

	return matchedLineIDs;
}


function getOppositeDirection(thisDirection) {
	let obj = arr.find(o => o.direction === thisDirection);
	return obj.oppositeDirection;
}

function calculateFoxTokenScoring() {
	let foxScoringValues = {
		'1': 1,
		'2': 2,
		'3': 3,
		'4': 4,
		'5': 5
	}
	
	const tokenIDs = Object.keys(allPlacedTokens);
			
	for (const tokenID of tokenIDs) {

		if(allPlacedTokens[tokenID] == 'fox') {
			
			let neighbourTiles = neighbourTileIDs(tokenID);

			let allNeighbouringWildlife = [];

			for (let i = 0; i < neighbourTiles.length; i++) {

				if(allPlacedTokens.hasOwnProperty(neighbourTiles[i])) {
					allNeighbouringWildlife.push(allPlacedTokens[neighbourTiles[i]]);
				}
			}

			if(allNeighbouringWildlife.length != 0) {
				for (let j = 0; j < allNeighbouringWildlife.length; j++) {
				}
	
				let uniqueWildlife = allNeighbouringWildlife.filter(onlyUnique);
	
				let numUniqueWildlife = uniqueWildlife.length;
				
				tokenScoring.fox.totalScore += foxScoringValues[numUniqueWildlife];
			}

		}
	}
}

function calculateHawkTokenScoring() {
	let hawkScoringValues = {
		'0': 0,
		'1': 2,
		'2': 5,
		'3': 8,
		'4': 11,
		'5': 14,
		'6': 18,
		'7': 22,
		'8': 26
	}
	
	const tokenIDs = Object.keys(allPlacedTokens);

	let numIsolatedHawks = 0;
			
	for (const tokenID of tokenIDs) {

		if(allPlacedTokens[tokenID] == 'hawk') {
			
			let neighbourTiles = neighbourTileIDs(tokenID);

			let neighbouringHawks = false;

			for (let i = 0; i < neighbourTiles.length; i++) {
				if(allPlacedTokens.hasOwnProperty(neighbourTiles[i])) {
					if(allPlacedTokens[neighbourTiles[i]] == 'hawk') {
						neighbouringHawks = true;
					}
				}
			}
			if(!neighbouringHawks) {
				numIsolatedHawks++;
			}
			
		}
	}

	if(numIsolatedHawks > 8) numIsolatedHawks = 8;

	tokenScoring.hawk.totalScore = hawkScoringValues[numIsolatedHawks];

}

let usedSalmonTokenIDs = [];
let potentialSalmonTokenIDs = [];
let confirmedSalmonRuns = [];
	
function calculateSalmonTokenScoring() {

	let salmonScoringValues = {
		'1': 2,
		'2': 4,
		'3': 7,
		'4': 11,
		'5': 15,
		'6': 20,
		'7': 26
	}

	const tokenIDs = Object.keys(allPlacedTokens);

	let allSalmonTileIDs = [];
			
	for (const tokenID of tokenIDs) {
		
		if(allPlacedTokens[tokenID] == 'salmon') {
			allSalmonTileIDs.push(tokenID);
		}
	}

	let validSalmonTiles = []

	for (let i = 0; i < allSalmonTileIDs.length; i++) {
		let neighbouringSalmon = searchNeighbourTilesForWildlife(allSalmonTileIDs[i], 'salmon');
		if(neighbouringSalmon.length <= 2) {
			validSalmonTiles.push(allSalmonTileIDs[i]);
		} else {
			usedSalmonTokenIDs.push(allSalmonTileIDs[i]);	
		}
	}

	for (let j = 0; j < validSalmonTiles.length; j++) {

		potentialSalmonTokenIDs = [];

		if(usedSalmonTokenIDs.indexOf(validSalmonTiles[j]) == -1) {

			let potentialNeighbourSalmon = searchNeighbourTilesForWildlife(validSalmonTiles[j], 'salmon');
			let confirmedNeighbourSalmon = [];
			
			for (let k = 0; k < potentialNeighbourSalmon.length; k++) {
				if(usedSalmonTokenIDs.indexOf(potentialNeighbourSalmon[k]) == -1) {
					confirmedNeighbourSalmon.push(potentialNeighbourSalmon[k]);
				}
			}
	
			if(confirmedNeighbourSalmon.length == 2) {
				let tilesToCheck = [validSalmonTiles[j]];
				tilesToCheck.push(...confirmedNeighbourSalmon);
	
				let firstNeighbourTiles = neighbourTileIDs(confirmedNeighbourSalmon[0]);
				let secondNeighbourTiles = neighbourTileIDs(confirmedNeighbourSalmon[1]);
	
				if(firstNeighbourTiles.indexOf(confirmedNeighbourSalmon[1]) === -1 && secondNeighbourTiles.indexOf(confirmedNeighbourSalmon[0]) === -1) {
					// perform a run forwards and backwards!!
					let forwardsAndBackwardsSalmonRunIDs = forwardsAndBackwardsSalmonRun(validSalmonTiles[j], confirmedNeighbourSalmon);
	
					potentialSalmonTokenIDs.push(...forwardsAndBackwardsSalmonRunIDs);
						
				} else {
					// since all tokens with 3 or more neighbours have been removed - if this criteria of the loop is met it HAS to be a valid triangle formation
					potentialSalmonTokenIDs.push(...tilesToCheck);
					usedSalmonTokenIDs.push(...tilesToCheck);	
				}
				
			} else if(confirmedNeighbourSalmon.length < 2) {
				potentialSalmonTokenIDs.push(validSalmonTiles[j]);
				let salmonRunIDs = salmonTokensInRun(validSalmonTiles[j], 'salmon');
				potentialSalmonTokenIDs.push(...salmonRunIDs);
	
			}
			confirmedSalmonRuns.push(potentialSalmonTokenIDs);
		}
	}

	confirmedSalmonRuns.sort(function (a, b) {
		return b.length - a.length;
	});

	for (let i = 0; i < confirmedSalmonRuns.length; i++) {
		let uniqueSalmonIDs = confirmedSalmonRuns[i].filter(onlyUnique);
		let salmonInRunNum = uniqueSalmonIDs.length;
		if(salmonInRunNum > 7) salmonInRunNum = 7;
		tokenScoring.salmon.totalScore += salmonScoringValues[salmonInRunNum];
	}
}

let currentSalmonRunIDs = [];
let forwardsAndBackwardsSalmonRunIDs = [];

function forwardsAndBackwardsSalmonRun(firstTile, startingTiles){
	forwardsAndBackwardsSalmonRunIDs = [];
	
	let nextWildlifeToken = '';
	
	forwardsAndBackwardsSalmonRunIDs = [firstTile];
	usedSalmonTokenIDs.push(firstTile);	
	
	for (let i = 0; i < startingTiles.length; i++) {

		let nextTokenID = startingTiles[i];
		forwardsAndBackwardsSalmonRunIDs.push(startingTiles[i]);
		usedSalmonTokenIDs.push(startingTiles[i]);	

		let forwardsBackwardsSalmonRunEnded = false;

		while (!forwardsBackwardsSalmonRunEnded) {

			let result = searchNeighbourTilesForWildlife(nextTokenID, 'salmon');

			for (let i = result.length - 1; i >= 0; i--) {
				// Because the previous tile in the run would also be included as part of this function - we can go ahead and remove it
				if(usedSalmonTokenIDs.indexOf(result[i]) !== -1) {
					result.splice(i,1);
				}
			}
			if(result.length == 1) {
				forwardsAndBackwardsSalmonRunIDs.push(result[0]);
				usedSalmonTokenIDs.push(result[0]);
				nextTokenID = result[0];
			} else {
				forwardsBackwardsSalmonRunEnded = true;
			}

		}
	}
	return forwardsAndBackwardsSalmonRunIDs;
}

function salmonTokensInRun(startID, thisWildlife) {
	
	currentSalmonRunIDs = []

	let nextWildlifeToken = '';
	let nextTokenID = startID;

	currentSalmonRunIDs = [startID];
	usedSalmonTokenIDs.push(startID);	

	let salmonRunEnded = false;

	while (!salmonRunEnded) {

		let result = searchNeighbourTilesForWildlife(nextTokenID, thisWildlife);

		for (let i = result.length - 1; i >= 0; i--) {
			// Because the previous tile in the run would also be included as part of this function - we can go ahead and remove it
			if(usedSalmonTokenIDs.indexOf(result[i]) !== -1) {
				result.splice(i,1);
			}
		}

		if(result.length == 1) {
			currentSalmonRunIDs.push(result[0]);
			usedSalmonTokenIDs.push(result[0]);
			nextTokenID = result[0];
		} else {
			salmonRunEnded = true;
		}
	}

	return currentSalmonRunIDs;
}

function searchNeighbourTilesForWildlife(currentID, thisWildlife) {

	let matchedTileIDs = [];

	let splitTileID = currentID.split('-');

	let thisRow = parseInt(splitTileID[1]);
	let thisColumn = parseInt(splitTileID[3]);

	let rowColMapSet = thisRow % 2;
	if(rowColMapSet != 0) rowColMapSet = 1;

	for (let i = 0; i < linkedTileSides.length; i++) {
		let newRow = thisRow + linkedTileSides[i].rowColMapping[rowColMapSet].rowDif;
		let newColumn = thisColumn + linkedTileSides[i].rowColMapping[rowColMapSet].colDif;		
		let newTileID = 'row-' + newRow + '-column-' + newColumn;

		if(allPlacedTokens.hasOwnProperty(newTileID)){
			if(allPlacedTokens[newTileID] == thisWildlife) {
				matchedTileIDs.push(newTileID);
			}
		}
	}
	
	return matchedTileIDs;
}

function neighbourTileIDs(currentID) {

	let neighbourIDs = [];

	let splitTileID = currentID.split('-');

	let thisRow = parseInt(splitTileID[1]);
	let thisColumn = parseInt(splitTileID[3]);

	let rowColMapSet = thisRow % 2;
	if(rowColMapSet != 0) rowColMapSet = 1;

	for (let i = 0; i < linkedTileSides.length; i++) {
		let newRow = thisRow + linkedTileSides[i].rowColMapping[rowColMapSet].rowDif;
		let newColumn = thisColumn + linkedTileSides[i].rowColMapping[rowColMapSet].colDif;		
		let newTileID = 'row-' + newRow + '-column-' + newColumn;


		neighbourIDs.push(newTileID);
	}

	return neighbourIDs;

}

function nextElkTokenInDirection(startID, thisDirection) {

	let startIDType = typeof startID;
	let splitTileID = startID.split('-');

	let thisRow = parseInt(splitTileID[1]);
	let thisColumn = parseInt(splitTileID[3]);

	let rowColMapSet = thisRow % 2;
	if(rowColMapSet != 0) rowColMapSet = 1;

	let directionIndex = directions.indexOf(thisDirection);

	let newRow = thisRow + linkedTileSides[directionIndex].rowColMapping[rowColMapSet].rowDif;
	let newColumn = thisColumn + linkedTileSides[directionIndex].rowColMapping[rowColMapSet].colDif;		

	let newTileID = 'row-' + newRow + '-column-' + newColumn;

	if(allPlacedTokens.hasOwnProperty(newTileID)) {
		if(allPlacedTokens[newTileID] == 'elk' && usedElkTokenIDs.indexOf(newTileID) == -1) {
			return newTileID;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
}

Object.defineProperties(Array.prototype, {
    count: {
        value: function(value) {
            return this.filter(x => x==value).length;
        }
    }
});


jQuery.fn.extend({
    // Modified and Updated by MLM
    // Origin: Davy8 (http://stackoverflow.com/a/5212193/796832)
    parentToAnimate: function(newParent, duration) {

        duration = duration || 'slow';
        
		var $element = $(this);

		newParent = $(newParent); // Allow passing in either a JQuery object or selector

		var oldOffset = $element.offset();
        $(this).appendTo(newParent);
        var newOffset = $element.offset();
        
		var temp = $element.clone().appendTo('body');

		let startTransformVal = 'scale(1)';
		let endTransformVal = 'scale(1)';

		let transformProperty = $('#container').css('transform');

		if(transformProperty != 0) {
			endTransformVal = transformProperty;
		}

		if($element[0].className == 'earnedNatureToken') {

			temp.css({
				'position': 'absolute',
				'top': oldOffset.top,
				'left': oldOffset.left,
			});
			
			$element.hide();

			temp.animate({
				'top': newOffset.top - 20,
				'left': newOffset.left - 100,
			}, 1300, function() {
				$element.remove();
				temp.remove();
			});

		} else if($element[0].className == 'tileContainer' || $element[0].className == 'tileContainer lockedIn' || $element[0].className == 'tileContainer chosenNatureCubeTile lockedIn' || $element[0].className == 'activeToken') {

			let zoomScale = Number(zoomLevel)/10;

			let startWidth = 0;
			let startHeight = 0;
			let endWidth = 0;
			let endHeight = 0;

			let startOpacity = 0;
			let endOpacity = 0;

			
			if(newParent[0].offsetParent.id == 'mapHiddenOverlay') {

				startWidth = $element[0].offsetWidth;
				startHeight = $element[0].offsetHeight;
				
				endWidth = startWidth * zoomScale;
				endHeight = startHeight * zoomScale;

				startOpacity = 1;
				endOpacity = 1;

			} else if(newParent[0].offsetParent.id == 'tileTokenContainer') {

				endWidth = $element[0].offsetWidth;
				endHeight = $element[0].offsetHeight;
				
				startWidth = endWidth * zoomScale;
				startHeight = endHeight * zoomScale;

				startOpacity = 1;
				endOpacity = 0.75;

			}

			temp.css({
				'position': 'absolute',
				'left': oldOffset.left,
				'top': oldOffset.top,
				'transform': startTransformVal,
				'width': startWidth,
				'height': startHeight,
				'opacity': startOpacity,
				'zIndex': 1000
			});
			
			$element.hide();

			temp.animate({
				'top': newOffset.top,
				'transform': endTransformVal,
				'left': newOffset.left,
				'width': endWidth,
				'height': endHeight,
				'opacity': endOpacity
			}, duration, function() {
				$element.show();
				temp.remove();
			});

		} else if($element[0].className == 'tileContainer movingElementOpacity' || $element[0].className == 'token movingElementOpacity') {

			temp.css({
				'position': 'absolute',
				'left': oldOffset.left,
				'top': oldOffset.top,
				'transform': startTransformVal,
				'opacity': .75,
				'zIndex': 1000
			});
			
			$element.hide();

			temp.animate({
				'top': newOffset.top,
				'transform': endTransformVal,
				'left': newOffset.left,
				'opacity': .75
			}, duration, function() {
				$element.show();
				temp.remove();
				$element.css('opacity', '1');
			});

		} else {

			temp.css({
				'position': 'absolute',
				'left': oldOffset.left,
				'top': oldOffset.top,
				'transform': startTransformVal,
				'zIndex': 1000
			});
			
			$element.hide();

			temp.animate({
				'top': newOffset.top,
				'transform': endTransformVal,
				'left': newOffset.left
			}, duration, function() {
				$element.show();
				temp.remove();
			});

		}

    }
});

function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function openInNewTab(url) {
	var win = window.open(url, '_blank');
	win.focus();
  }

function returnDuplicates(arr, arr2) {
    var ret = [];
    for(var i in arr) {   
        if(arr2.indexOf(arr[i]) > -1){
            ret.push(arr[i]);
        }
    }
    return ret.toString();
};


function allPossibleCases(arr) {
	if (arr.length === 0) {
		return [];
	} else if (arr.length ===1) {
		return arr[0];
	} else {
		var result = [];
		var allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array
		for (var c in allCasesOfRest) {
			for (var i = 0; i < arr[0].length; i++) {
				result.push(`${arr[0][i]} ${allCasesOfRest[c]}`);
			}
		}
		return result;
	}
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}
