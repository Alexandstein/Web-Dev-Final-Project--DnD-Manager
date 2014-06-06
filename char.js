//Some semantic data//
var abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
var defenseNames = ['for', 'ref', 'wil'];
var attributeNames = ['name', 'class', 'race', 'align', 'gender'];
var miscNames = ['hp', 'hpMax', 'lv'];
var acNames = ['ac', 'grapple'];

var defenseAbilityMapping = {'for':'con', 'ref':'dex', 'wil':'wis'};

//Types of inputs for things//
var abilityInputNames = ['_TotalInput', '_BaseInput', '_BonusInput', '_PenalInput', '_ModInput'];
var defenseInputNames = ['_TotalInput', '_BaseInput','_ModInput', '_MiscInput'];

//Valid commands
var validCommands = ['save', 'load', 'delete', 'clear', 'help', 'setHP', 'damage', 'heal'];

//Global objects
var activeCharacter;
var characterFiles;

//Globals for storing important elements//
var abilityContainer;
var attributes;
var inputs = {};
var commandBox;
var outputConsole;

//Templates//
var abilityTemplate = "		<div id='{ability}Container' class='characterAttr'>\
			<span class='attrName'>{ABILITY}</span>\
				<input id='{ability}_TotalInput' class='ability totalBox' readonly placeholder='Total' pattern='[0-9]+' type='text'></input> = \n\
				<input id='{ability}_BaseInput' class='ability ability_Input' placeholder='Base' pattern='[0-9]+' type='text'></input> + \n\
				<input id='{ability}_BonusInput' class='ability ability_Input' placeholder='Bonus' pattern='[0-9]+' type='test'></input> -\n\
				<input id='{ability}_PenalInput' class='ability ability_Input' placeholder='Penal.' pattern='[0-9]+' type='test'></input>\n\
				<input id='{ability}_ModInput' class='ability totalBox' readonly placeholder='Mod'  pattern='[0-9]+'type='text'></input>\n\
		</div>\n";

var defenseTemplate = "			<div id='{defense}Container' class='characterAttr'>\n\
				<span class='attrName'>{DEFENSE}</span>\n\
					<input id='{defense}_TotalInput' class='defense totalBox' readonly placeholder='Total' type='text'></input> = \n\
					<input id='{defense}_BaseInput' class='defense defense_Input' placeholder='Base' type='text'></input> + \n\
					<input id='{defense}_ModInput' class='defense totalBox' readonly placeholder='Mod' type='text'></input> +\n\
					<input id='{defense}_MiscInput' class='defense defense_Input' placeholder='Misc' type='text'></input>\n\
			</div>\n";
			
var attributeTemplate = "				<div id='{attr}Container' class='characterAttr'>\n\
					<span class='attrName'>{Attr}:</span><input id='{attr}_Input' class='attribute attribute_Input' type='text'></input>\n\
				</div>\n";

//Utility functions//
//Replace all instances of a sequence in a string
function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'g'), replace);
}

//Find a key in an object given the value
function getKey(obj, value){
    keys = Object.keys(obj);
    for(var i = 0; i < keys.length; i++){
        if(obj[keys[i]] == value){
             return keys[i];   
        }
    }
    return undefined;
}

function capitalize(str)
{
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function strip(string){
	return string.replace(/(^\s+|\s+$)/g,'');
}

//More important functions//

//Load the attribute HTML
function loadElementsAttributes(abilityNames, defenseNames, attributeNames){
	var output = ''
	
	//Load main abilities
	for (var i = 0; i < abilityNames.length; i++ ) {
		var buffer = replaceAll('{ability}', abilityNames[i], abilityTemplate);
		output +=  replaceAll('{ABILITY}', abilityNames[i].toUpperCase(), buffer);
	}
	
	//Load defense abilities
	for (var i = 0; i < defenseNames.length; i++ ) {
		var buffer = replaceAll('{defense}', defenseNames[i], defenseTemplate);
		output +=  replaceAll('{DEFENSE}', defenseNames[i].toUpperCase(), buffer);
	}
	abilityContainer.innerHTML = output;
	
	output = '';
	//Load attributes
	for (var i = 0; i < attributeNames.length; i++ ) {
		var buffer = replaceAll('{attr}', attributeNames[i], attributeTemplate);
		output +=  replaceAll('{Attr}', capitalize(attributeNames[i]), buffer);
	}
	attributes.innerHTML = output;
}

//Load Inputs into Object
function loadElementsInputs(){
	//TODO DEBUG
	var inputElements = document.getElementsByTagName("INPUT");
	var test = '';
	for(var i = 0; i < inputElements.length; i++){
		inputs[inputElements[i].id] = inputElements[i] ;		//Arrange by name
	}	
}

function loadInputListeners(){
	var defenseInputs = document.getElementsByClassName('defense_Input');
	var abilityInputs = document.getElementsByClassName('ability_Input');	
	var attributeInputs = document.getElementsByClassName('attribute_Input');
	var miscInputs = document.getElementsByClassName('misc_Input');
	var acInputs = document.getElementsByClassName('ac_Input');
	var grappleInputs = document.getElementsByClassName('grapple_input');
	
	for (var i = 0; i < defenseInputs.length; i++){
		defenseInputs[i].addEventListener('change',handleDefenseChange, false);
	}
	for (var i = 0; i < abilityInputs.length; i++){
		abilityInputs[i].addEventListener('change',handleAbilityChange, false);
	}
	for (var i = 0; i < attributeInputs.length; i++){
		attributeInputs[i].addEventListener('change',handleAttributeChange, false);
	}
	for (var i = 0; i < miscInputs.length; i++){
		miscInputs[i].addEventListener('change',handleMiscChange, false);
	}
	for (var i = 0; i < acInputs.length; i++){
		acInputs[i].addEventListener('change',handleAcChange, false);
	}
	for (var i = 0; i < grappleInputs.length; i++){
		grappleInputs[i].addEventListener('change',handleGrappleChange, false);
	}
	commandBox.addEventListener('keypress', handleCommandEntry, false);
}

function getAbilityValue(attribute, field){
	inputs[attribute + capitalize(field) + 'Input'].value;
}

//Evaluates ability scores and fills in their Mod and total scores.
function evaluateAbility(abilityName){
	//check whether valid ability name. Return without doing anything if not a valid name.
	if(abilityNames.indexOf(abilityName) < 0){
		return;
	}
	var base = Number(inputs[abilityName + '_BaseInput'].value);
	var bonus = Number(inputs[abilityName + '_BonusInput'].value);
	var penal = Number(inputs[abilityName + '_PenalInput'].value);
	var mod = Math.floor((base - 10)/2);
	
	var total = base + bonus - penal;
	if(isNaN(total)){
		alert("Error: Non-numerical value detected in " + abilityName.toUpperCase());
		return;
	}
	
	inputs[abilityName + '_ModInput'].value = mod;
	inputs[abilityName + '_TotalInput'].value = total;
	
	var defense;
	if((defense = getKey(defenseAbilityMapping, abilityName)) != undefined){
		evaluateDefense(defense);
	}
	//Update dependencies
	
}

//Evaluates ability scores and fills in their Mod and total scores.
function evaluateDefense(defenseName){
	//check whether valid defense name. Return without doing anything if not a valid name.
	if(defenseNames.indexOf(defenseName) < 0){
		return;
	}
	var base = Number(inputs[defenseName + '_BaseInput'].value);
	var misc = Number(inputs[defenseName + '_MiscInput'].value);
	var abilityMod = Number(inputs[defenseAbilityMapping[defenseName] + '_ModInput'].value);
	
	var total = base + misc + abilityMod;
	
	if(isNaN(total)){
		alert("Error: Non-numerical value detected in " + defenseName.toUpperCase());
		return;
	}
	inputs[defenseName + '_ModInput'].value = abilityMod;
	inputs[defenseName + '_TotalInput'].value = total;
}

function evaluateAc(){
	var armor 	= Number(inputs['ac_ArmorBonusInput'].value);
	var shield 	= Number(inputs['ac_ShieldBonusInput'].value);
	var sizeMod	= Number(inputs['ac_SizeModInput'].value);
	var natural	= Number(inputs['ac_NaturalArmorInput'].value);
	var deflect	= Number(inputs['ac_DeflectionInput'].value);
	var misc	= Number(inputs['ac_MiscInput'].value);
	//fetch elements
	var mod		= inputs['ac_ModInput'];
	var total	= inputs['ac_TotalInput'];
	
	mod.value 	= Number(inputs['dex_ModInput'].value);
	var sum = Number(armor) + Number(shield) + Number(sizeMod) + Number(mod.value) + 
	              Number(natural) + Number(deflect) + Number(misc);
	if(isNaN(sum)){
		alert("Error: Non-numerical value detected in AC");
		return;
	}
	
	total.value = sum;
}

function evaluateGrapple(){
	var attack 	= Number(inputs['grapple_BaseAttackInput'].value);
	var sizeMod	= Number(inputs['grapple_SizeModInput'].value);
	var misc	= Number(inputs['grapple_MiscInput'].value);
	//fetch elements
	var mod		= inputs['grapple_ModInput'];
	var total	= inputs['grapple_TotalInput'];
	
	mod.value 	= Number(inputs['str_ModInput'].value);
	var sum = Number(attack) + Number(sizeMod) + Number(misc) + Number(mod.value);
	if(isNaN(sum)){
		alert("Error: Non-numerical value detected in AC");
		return;
	}
	total.value = sum;
}

function printToConsole(string){
	outputConsole.value += string + '\n\n';
	outputConsole.scrollTop = outputConsole.scrollHeight - outputConsole.clientHeight;
}

function executeCommand(commandString){
	var command = commandString.split(' ');
	
	switch(command[0]){
		case 'help':
			var output = 'List of commands:\n--save [<string>]: Saves your character data. Optionally, provide a string for a name to save separately.\n--clear: Clears all of the inputs.\n--chars: Prints a list of savec characters.\n--load <string>: Loads a character if it exists.\n--setHP <int>: Sets HP to a number\n--heal <int>: Adds number to HP\n--damage <int>: Subtracts from HP';
			printToConsole(output);
			break;
		case 'save':
			if(command.length > 1){
				saveData(command[1]);				//Save to a file name if given
				printToConsole('Character data saved as ' + command[1]);
			}else{
				saveData();							//Else, use default
				printToConsole('Character data saved');
			}
			break;
		case 'clear':
			localStorage.removeItem('lastUsedChar');
			for(var i in inputs){
				inputs[i].value = '';			//Clear all inputs
			}
			printToConsole('Character data deleted');
			break;
		case 'load':
			if(command.length > 1){
				printToConsole('Loading character...');
				loadData(command[1]);
			}else{
				printToConsole('\'load\' needs 2nd argument.');
				return;
			}
			break;
		case 'chars':
			var output = ''
			for(var i in characterFiles){
				output += '\t' + characterFiles[i] + '\n';
			}
			printToConsole(output);
			break;
		case 'setHP':
			var newHP = Number(command[1]);
		
			if(isNaN(newHP)){
				printToConsole('Error: 2nd argument of ' + command[0] + ' must be a number.');
				return;
			}
		
			inputs['hp_Input'].value = Number(newHP);
			printToConsole('HP is now ' + newHP);
			break;
		case 'heal':
			var newHP = Number(command[1]) + Number(inputs['hp_Input'].value);
		
			if(isNaN(newHP)){
				printToConsole('Error: 2nd argument of ' + command[0] + ' must be a number.');
				return;
			}
		
			inputs['hp_Input'].value = Number(newHP);
			printToConsole('HP is now ' + newHP);
			break;
		case 'damage':
			var newHP = Number(inputs['hp_Input'].value) - Number(command[1]);
		
			if(isNaN(newHP)){
				printToConsole('Error: 2nd argument of ' + command[0] + ' must be a number.');
				return;
			}
		
			inputs['hp_Input'].value = Number(newHP);
			printToConsole('HP is now ' + newHP);
			break;
		default:
			printToConsole("Error: '" + commandString + "' is not a valid command");
			return;
	}
	updateMisc('hp');
}

//Handlers//
function testHandler(){
	saveData();
	console.log(activeCharacter);
}

function handleAbilityChange(event){
	var name = event.target.id.split('_')[0]; //Split id string to get attr name
	evaluateAbility(name);
	
	//Update the character object
	updateAbility(name);
	updateDefense(getKey(defenseAbilityMapping, name));
}

function handleDefenseChange(event){
	var name = event.target.id.split('_')[0];
	evaluateDefense(name);
	
	//Update the character object
	updateDefense(name);
}

function handleAttributeChange(event){
	var name = event.target.id.split('_')[0];
	updateAttribute(name);
}

function handleMiscChange(event){
	var name = event.target.id.split('_')[0];
	updateMisc(name);
}

function handleAcChange(event){
	evaluateAc();
	updateAc(name);
}

function handleGrappleChange(event){
	evaluateGrapple();
	updateGrapple();
}

function handleCommandEntry(event){
	if(event.keyIdentifier == 'Enter' || event.key == 'Enter'){
		var command = strip(commandBox.value);
		if(command == ''){
			return;
		}else{
        	executeCommand(command);
       		commandBox.value = '';				//Clear input
       	}
    }
}

//Constructors
function Character(name){
	if(name === undefined){	//Set default name if none given
		name = 'Untitled';
	}
	this.hp			= 0;
	this.hpMax		= 0;
	this.lv			= 0;
	this.ability 	= {};
	this.attribute	= {'name':name};
	this.defense	= {};
	this.ac 		= {armor:0, shield:0, sizeMod:0, natural:0, misc:0, mod:0, total:0};
	this.grapple	= {attack:0, size:0, misc:0, mod:0, total:0};
	
	for(var i = 0; i < abilityNames.length; i++){
		this.ability[abilityNames[i]] = new Ability(abilityNames[i]);
	}
	
	for(var i = 0; i < defenseNames.length; i++){
		this.defense[defenseNames[i]] = new Defense(defenseNames[i]);
	}
	
	for(var i = 0; i < attributeNames.length; i++){
		this.attribute[attributeNames[i]] = '';
	}
}

function Ability(name){
	this.name 	= name;
	this.total	= 0;
	this.base	= 0;
	this.bonus	= 0
	this.penal	= 0;
	this.mod	= 0;
}

function Defense(name){
	this.name 	= name;
	this.total	= 0;
	this.base	= 0;
	this.mod	= 0;
	this.misc	= 0;
}

function Attribute(name){
	this.name	= 0;
	this.value	= '';
}

function Item(name, quantity){
	this.name = name;
	this.quantity = quantity;
}

//Methods used to update the character object//
function updateDefense(name){
	var defense = activeCharacter.defense[name];
	for (key in defense) {
		if(key == 'name'){
			continue;			//Skip 'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		defense[key] = Number(inputs[inputName].value);
	}
}

function updateAbility(name){
	var ability = activeCharacter.ability[name];
	for (key in ability) {
		if(key == 'name'){
			continue;			//Skip 'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		ability[key] = Number(inputs[inputName].value);
	}
}

function updateAttribute(name){
	var inputName = name + '_Input';
	activeCharacter.attribute[name] = inputs[inputName].value;
}

function updateMisc(name){
	var inputName = name + '_Input';
	activeCharacter[name] = inputs[inputName].value;
}

function updateAc(){
	//fetch values
	activeCharacter.ac['armor'] 	= Number(inputs['ac_ArmorBonusInput'].value);
	activeCharacter.ac['shield']	= Number(inputs['ac_ShieldBonusInput'].value);
	activeCharacter.ac['sizeMod']	= Number(inputs['ac_SizeModInput'].value);
	activeCharacter.ac['natural']	= Number(inputs['ac_NaturalArmorInput'].value);
	activeCharacter.ac['deflect']	= Number(inputs['ac_DeflectionInput'].value);
	activeCharacter.ac['misc']		= Number(inputs['ac_MiscInput'].value);
	activeCharacter.ac['mod']		= Number(inputs['ac_ModInput'].value);
	activeCharacter.ac['total']		= Number(inputs['ac_TotalInput'].value);
}

function updateGrapple(){
	//fetch values
	activeCharacter.grapple['attack'] 	= Number(inputs['grapple_BaseAttackInput'].value);
	activeCharacter.grapple['size']	=  Number(inputs['grapple_SizeModInput'].value);
	activeCharacter.grapple['misc']	= Number(inputs['grapple_MiscInput'].value);
	activeCharacter.grapple['mod']	= Number(inputs['grapple_ModInput'].value);
	activeCharacter.grapple['total']	= Number(inputs['grapple_TotalInput'].value);
}

//Methods used to load data from the character to the form//
function loadDefense(name){
	var defense = activeCharacter.defense[name];
	for (key in defense) {
		if(key == 'name'){
			continue;			//Skip 'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		inputs[inputName].value = Number(defense[key]);
	}
}

function loadAbility(name){
	var ability = activeCharacter.ability[name];
	for (key in ability) {
		if(key == 'name'){
			continue;			//Skip 'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		inputs[inputName].value = Number(ability[key]);
	}
}

function loadAttribute(name){
	var inputName = name + '_Input';
	inputs[inputName].value = activeCharacter.attribute[name];
}

function loadMisc(name){
	var inputName = name + '_Input';
	inputs[inputName].value = activeCharacter[name];
}

function loadAc(){
	//fetch values
	inputs['ac_ArmorBonusInput'].value 	= Number(activeCharacter.ac['armor']);
	inputs['ac_ShieldBonusInput'].value	= Number(activeCharacter.ac['shield']);
	inputs['ac_SizeModInput'].value	= Number(activeCharacter.ac['sizeMod']);
	inputs['ac_NaturalArmorInput'].value = Number(activeCharacter.ac['natural']);
	inputs['ac_DeflectionInput'].value = Number(activeCharacter.ac['deflect']);
	inputs['ac_MiscInput'].value = Number(activeCharacter.ac['misc']);
	inputs['ac_ModInput'].value	= Number(activeCharacter.ac['mod']);
	inputs['ac_TotalInput'].value = Number(activeCharacter.ac['total']);
}

function loadGrapple(){
	inputs['grapple_BaseAttackInput'].value = Number(activeCharacter.grapple['attack']);
	inputs['grapple_SizeModInput'].value =  Number(activeCharacter.grapple['size']);
	inputs['grapple_MiscInput'].value = Number(activeCharacter.grapple['misc']);
	inputs['grapple_ModInput'].value = Number(activeCharacter.grapple['mod']);
	inputs['grapple_TotalInput'].value = Number(activeCharacter.grapple['total']);
}


//Saving to and from local storage//
function saveData(filename){
	localStorage.setItem('lastUsedChar', JSON.stringify(activeCharacter));
	if(filename != undefined){
		if(characterFiles.indexOf(filename) < 0){		//If filename not in array, add
			characterFiles.push(filename);
		}
		localStorage.setItem(filename + '_char', JSON.stringify(activeCharacter));
		localStorage.setItem('characterFiles', JSON.stringify(characterFiles))
	}
}

function loadData(filename){
	var characterData;
	if(filename != undefined){					//If asking for specific character
		if(characterFiles.indexOf(filename) < 0){
			printToConsole('Character ' + filename + ' not found.');
			return;
		}else{
			characterData = localStorage[filename + '_char'];
		}
	}else{										//None specified, use default
		characterData = localStorage['lastUsedChar'];
	}
	
	var characterFilesData = localStorage['characterFiles'];
	if(characterData){								//Check if last-used character
		characterData = JSON.parse(characterData);
	}else{
		activeCharacter = new Character();			//If not make a clear one.
		return;
	}
	if(characterFilesData){							//Check if files array
		characterFiles = JSON.parse(characterFilesData);
	}else{											//If not, make one.
		characterFiles = new Array();
	}
	activeCharacter = characterData;
	
	//Load data here
	for(var i in abilityNames){
		loadAbility(abilityNames[i]);
	}
	for(var i in defenseNames){
		loadDefense(defenseNames[i]);
	}
	for(var i in attributeNames){
		loadAttribute(attributeNames[i]);
	}
	for(var i in miscNames){
		loadMisc(miscNames[i]);
	}
	loadAc();
	loadGrapple();
}

window.onload = function init(){
	//Grab important elements
	abilityContainer = document.getElementById('abilityContainer');
	attributes = document.getElementById('attributes');
	commandBox = document.getElementById('commandBox');
	outputConsole = document.getElementById('outputConsole');
	//Load fields
	loadElementsAttributes(abilityNames, defenseNames, attributeNames);
	//Grab inputs
	loadElementsInputs();
	
	//All elements have been loaded at this point
	if(!loadData()){									//Try to load data;
						//New character if not
	}
	
	//Attach listeners to auto-updating fields
	loadInputListeners();
	
	document.getElementById('testButton').onclick = testHandler;
}