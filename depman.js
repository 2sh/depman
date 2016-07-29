/*!
 * Copyright (c) 2016 2sh <contact@2sh.me>
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
function DependencyManager(components, callbackFinal, callbackError)
{
	var self = this;
	self.components = components;
	self.callbackFinal = callbackFinal;
	self.callbackError = callbackError;
	self.componentsDependants = {};
	
	for(var c=0; c<components.length; c++)
	{
		self.componentsDependants[components[c][0]] = [];
	}
	
	for(var c=0; c<components.length; c++)
	{
		var component = components[c];
		for(var d=0; d<component[2].length; d++)
		{
			self.componentsDependants[component[2][d]].push(component);
		}
	}
}

DependencyManager.prototype.run = function()
{
	var self = this;
	self.componentsDependencies = {};
	for(var c=0; c<self.components.length; c++)
	{
		var component = self.components[c];
		self.componentsDependencies[component[0]] =
			component[2].slice();
	}
	
	function f(component)
	{
		self.__runComponent(component);
	}
	
	self.runCount = 0;
	for(var c=0; c<self.components.length; c++)
	{
		var component = self.components[c];
		var dependencies = self.componentsDependencies[component[0]];
		if(!(dependencies && dependencies.length))
		{
			self.runCount++;
			delete self.componentsDependencies[component[0]];
			setTimeout(f, 0, component);
		}
	}
}

DependencyManager.prototype.__done = function(component, errorMessage)
{
	var self = this;
	self.runCount--;
	if(errorMessage === undefined)
	{
		function f(component)
		{
			self.__runComponent(component);
		}
		var dependants = self.componentsDependants[component[0]];
		for(var d=0; d<dependants.length; d++)
		{
			var dependant = dependants[d];
			var dependenciesRemaining =
				self.componentsDependencies[dependant[0]];
			var index = dependenciesRemaining.indexOf(component[0]);
			if(index !== -1) dependenciesRemaining.splice(index, 1);
			if(!dependenciesRemaining.length)
			{
				self.runCount++;
				delete self.componentsDependencies[dependant[0]];
				setTimeout(f, 0, dependant);
			}
		}
	}
	else if(self.callbackError)
	{
		self.callbackError(component, errorMessage);
	}
	
	if(self.runCount == 0 && self.callbackFinal)
	{
		self.callbackFinal();
	}
}

DependencyManager.prototype.__runComponent = function(component)
{
	var self = this;
	function done(errorMessage)
	{
		self.__done(component, errorMessage);
	}
	
	try
	{
		if(!component[1](done)) done();
	}
	catch(e)
	{
		console.error(e);
		done("Unknown error");
	}
}