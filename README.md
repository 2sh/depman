# Dependency Manager
This JavaScript library provides a manager with which the components within a dependency tree can be run asynchronously.

##Defining components
An array for each component contains the component's name, function and array of dependencies. Components for which the dependency array is not specified or left empty are run first.
```
var components =
[
	["load1", function(callback){...; return true}],
	["load2", function(callback){...; return true}],
	["something", function(){...}, ["process1"]],
	["process1", function(){...}, ["load1"]],
	["other", function(){...}, ["load1", "load2"]]
];
```
If a component is to report back on the completion of asynchronous tasks such as Ajax, the function needs to return true and the callback parameter can then be called upon completion of the tasks: ```callback([errorMessage])```. Specifying an error message will cause any dependant components not to be run and the message to be passed to the manager's error callback.

If their dependencies are met, components will be run in the array order. Keeping components containing Ajax or other asynchronous waiting tasks at the start of the components array allows other components to run in the meantime.

##Running the manager
The dependency manager takes the array of components, a run completion callback and an error callback as its arguments.

The following example shows how the components can be run repeatedly with a 30 second wait in between runs:
```
var depman;

function init()
{
	depman.run();
}

function loopWait()
{
	setTimeout(init, 30*1000);
}

function error(component, errorMessage)
{
	console.error(component, errorMessage);
}

depman = new DependencyManager(components, loopWait, error);

init();
```