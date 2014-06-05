//Some semantic data//
var abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
var defenseNames = ['for', 'ref', 'wil'];
var attributeNames = ['name', 'class', 'race', 'align', 'gender'];

var defenseAbilityMapping = {'for':'con', 'ref':'dex', 'wil':'wis'};

//Types of inputs for things//
var defenseInputNames = ['_TotalInput', '_BaseInput', '_BonusInput', '_PenalInput', '_ModInput'];
var defenseInputNames = ['_TotalInput', '_BaseInput','_ModInput', '_MiscInput'];

//Globals for storing important elements//
var activeCharacter;
var abilityContainer;
var attributes;
var inputs = {};

//Templates//
var abilityTemplate = "		<div id='{ability}Container' class='characterAttr'>\
			<span class='attrName'>{ABILITY}</span>\
				<input id='{ability}_TotalInput' class='totalBox' readonly placeholder='Total' pattern='[0-9]+' type='text'></input> = \n\
				<input id='{ability}_BaseInput' class='ability_Input' placeholder='Base' pattern='[0-9]+' type='text'></input> + \n\
				<input id='{ability}_BonusInput' class='ability_Input' placeholder='Bonus' pattern='[0-9]+' type='test'></input> -\n\
				<input id='{ability}_PenalInput' class='ability_Input' placeholder='Penal.' pattern='[0-9]+' type='test'></input>\n\
				<input id='{ability}_ModInput' class='totalBox' readonly placeholder='Mod'  pattern='[0-9]+'type='text'></input>\n\
		</div>\n";

var defenseTemplate = "			<div id='{defense}Container' class='characterAttr'>\n\
				<span class='attrName'>{DEFENSE}</span>\n\
					<input id='{defense}_TotalInput' class='totalBox' readonly placeholder='Total' type='text'></input> = \n\
					<input id='{defense}_BaseInput' class='defense_Input' placeholder='Base' type='text'></input> + \n\
					<input id='{defense}_ModInput' class='totalBox' readonly placeholder='Mod' type='text'></input> +\n\
					<input id='{defense}_MiscInput' class='defense_Input' placeholder='Misc' type='text'></input>\n\
			</div>\n";
			
var attributeTemplate = "				<div id='{attr}Container' class='characterAttr'>\n\
					<span class='attrName'>{Attr}:</span><input id='{attr}_Input' type='text'></input>\n\
				</div>\n";

//Utility functions
function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'g'), replace);
}

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

//More important functions//

//Load the attribute HTML
function loadAttributes(abilityNames, defenseNames, attributeNames){
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
function loadInputs(){
	//TODO DEBUG
	var inputElements = document.getElementsByTagName("INPUT");
	var test = '';
	for(var i = 0; i < inputElements.length; i++){
		inputs[inputElements[i].id] = inputElements[i] ;		//Arrange by name
	}
	
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

//Handlers//
function testHandler(){
	saveData();
}

function handleAbilityChange(event){
	var name = event.target.id.split('_')[0]; //Split id string to get attr name
	evaluateAbility(name);
	
	//Update the character object
	var ability = activeCharacter.ability[name];
	for (key in ability) {
		if(key == 'name'){
			continue;			//Skip 'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		ability[key] = Number(inputs[inputName].value);
	}
}

function handleDefenseChange(event){
	var name = event.target.id.split('_')[0]
	evaluateDefense(name[0]);
	
		//Update the character object
	var defense = activeCharacter.defense[name];
	for (key in defense) {
		if(key == 'name'){
			continue;			//Skip 'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		defense[key] = Number(inputs[inputName].value);
		console.log(defense);
	}
}

function handleMiscChange(event){
	
}

//Constructors
function Character(){
	this.hp			= 0;
	this.hpMac		= 0;
	this.lv			= 0;
	this.ability 	= {};
	this.attributes	= {};
	this.defense	= {};
	
	for(var i = 0; i < abilityNames.length; i++){
		this.ability[abilityNames[i]] = new Ability(abilityNames[i]);
	}
	
	for(var i = 0; i < defenseNames.length; i++){
		this.defense[defenseNames[i]] = new Defense(defenseNames[i]);
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

function saveData(){
	alert('saved');
	console.log(inputs);
	localStorage.setItem('dndChar', JSON.stringify(inputs));
}

function loadData(){
	var inputData = localStorage['dndChar'];
	if(inputData){
		inputData = JSON.parse(inputData);
		for(var i in inputData){
			inputs[i].value = inputData[i].value;
		}
	}else{
		return;
	}
}

window.onload = function init(){
	//Grab important elements
	abilityContainer = document.getElementById('abilityContainer');
	attributes = document.getElementById('attributes');
	//Load fields
	loadAttributes(abilityNames, defenseNames, attributeNames);
	//Grab inputs
	loadInputs();
	
	//All elements have been loaded at this point
	loadData();										//Try to load data;
	activeCharacter = new Character();
	
	//Attach listeners to auto-updating fields
	var defenseInputs = document.getElementsByClassName('defense_Input');
	var abilityInputs = document.getElementsByClassName('ability_Input');	
	for (var i = 0; i < defenseInputs.length; i++){
		defenseInputs[i].addEventListener('change',handleDefenseChange, false);
	}
	for (var i = 0; i < abilityInputs.length; i++){
		abilityInputs[i].addEventListener('change',handleAbilityChange, false);
	}
	
	console.log(activeCharacter);
	
	document.getElementById('testButton').onclick = testHandler;
}