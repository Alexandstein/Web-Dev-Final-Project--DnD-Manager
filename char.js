//Some semantic data//
var abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
var defenseNames = ['for', 'ref', 'wil'];
var attributeNames = ['name', 'class', 'race', 'align', 'gender'];

var defenseAbilityMapping = {'for':'con', 'ref':'dex', 'wil':'wis'};

//Types of inputs for things//
var defenseInputNames = ['TotalInput', 'BaseInput', 'BonusInput', 'PenalInput', 'ModInput'];
var defenseInputNames = ['TotalInput', 'BaseInput','ModInput', 'MiscInput'];

//Globals for storing important elements//
var abilityContainer;
var attributes;
var inputs = {};

//Templates//
var abilityTemplate = "		<div id='{ability}Container' class='characterAttr'>\
			<span class='attrName'>{ABILITY}</span>\
				<input id='{ability}TotalInput' class='totalBox' readonly placeholder='Total' pattern='[0-9]+' type='text'></input> = \n\
				<input id='{ability}BaseInput' class='abilityInput' placeholder='Base' pattern='[0-9]+' type='text'></input> + \n\
				<input id='{ability}BonusInput' class='abilityInput' placeholder='Bonus' pattern='[0-9]+' type='test'></input> -\n\
				<input id='{ability}PenalInput' class='abilityInput' placeholder='Penal.' pattern='[0-9]+' type='test'></input>\n\
				<input id='{ability}ModInput' class='totalBox' readonly placeholder='Mod'  pattern='[0-9]+'type='text'></input>\n\
		</div>\n";

var defenseTemplate = "			<div id='{defense}Container' class='characterAttr'>\n\
				<span class='attrName'>{DEFENSE}</span>\n\
					<input id='{defense}TotalInput' class='totalBox' readonly placeholder='Total' type='text'></input> = \n\
					<input id='{defense}BaseInput' class='defenseInput' placeholder='Base' type='text'></input> + \n\
					<input id='{defense}ModInput' class='totalBox' readonly placeholder='Mod' type='text'></input> +\n\
					<input id='{defense}MiscInput' class='defenseInput' placeholder='Misc' type='text'></input>\n\
			</div>\n";
			
var attributeTemplate = "				<div id='{attr}Container' class='characterAttr'>\n\
					<span class='attrName'>{Attr}:</span><input id='{attr}Input' type='text'></input>\n\
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
	var base = Number(inputs[abilityName + 'BaseInput'].value);
	var bonus = Number(inputs[abilityName + 'BonusInput'].value);
	var penal = Number(inputs[abilityName + 'PenalInput'].value);
	var mod = Math.floor((base - 10)/2);
	
	var total = base + bonus - penal;
	if(isNaN(total)){
		alert("Error: Non-numerical value detected in " + abilityName.toUpperCase());
		return;
	}
	
	inputs[abilityName + 'ModInput'].value = mod;
	inputs[abilityName + 'TotalInput'].value = total;
	
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
	var base = Number(inputs[defenseName + 'BaseInput'].value);
	var misc = Number(inputs[defenseName + 'MiscInput'].value);
	var abilityMod = Number(inputs[defenseAbilityMapping[defenseName] + 'ModInput'].value);
	
	var total = base + misc + abilityMod;
	
	if(isNaN(total)){
		alert("Error: Non-numerical value detected in " + defenseName.toUpperCase());
		return;
	}
	inputs[defenseName + 'ModInput'].value = abilityMod;
	inputs[defenseName + 'TotalInput'].value = total;
}

//Handlers//
function testHandler(){
	for(var i = 0; i < abilityNames.length; i++){
		evaluateAbility(abilityNames[i]);
	}
}

function handleAbilityChange(event){
	alert("Ability Change: " + event.target.id);
}

function handleDefenseChange(event){
	alert("Defense Change: " + event.target.id);
}

//Constructors
function Character(){
	self.ability 	= {};
	self.attributes	= {};
	self.defense	= {};
	
	for(var i = 0; i < abilityNames.length; i++){
		self.ability[abilityNames[i]] = Ability(abilityNames[i]);
	}
}

function Ability(name){
	self.name = name;
}

function Defense(name){
	self.name = name;
}

window.onload = function init(){
	//Grab important elements
	abilityContainer = document.getElementById('abilityContainer');
	attributes = document.getElementById('attributes');
	//Load fields
	loadAttributes(abilityNames, defenseNames, attributeNames);
	//Grab inputs
	loadInputs();
	//Attach listeners to auto-updating fields
	var defenseInputs = document.getElementsByClassName('defenseInput');
	var abilityInputs = document.getElementsByClassName('abilityInput');
	
	for (var i = 0; i < defenseInputs.length; i++){
		defenseInputs[i].onchange = handleDefenseChange;
	}
	for (var i = 0; i < abilityInputs.length; i++){
		abilityInputs[i].onchange = handleAbilityChange;
	}
	
	document.getElementById('testButton').onclick = testHandler;
}