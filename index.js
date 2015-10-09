var os = require('os')
var path = require('path')
var fs = require('fs')
var request = require('superagent');

var AppVeyorReporter = function (baseReporterDecorator, config, logger, helper, formatError) {
  var log = logger.create('reporter.appveyor')
  var doneCount = 0;
  var doneCallback;
  var baseUrl = process.env.APPVEYOR_API_URL+'/api/tests';

  baseReporterDecorator(this)

  this.specSuccess = function(browser, result){
      doneCount++;
      request.post(baseUrl).send({
          testName:result.description,
          testFramework:"Karma",
          fileName:result.suite,
          outcome:"Passed",
          durationMilliseconds:result.time
      }).end(function(err, res){
          doneCount--;
          if(doneCount === 0 && doneCallback){
              doneCallback();
          }
      });
  } 
  this.specSkipped = function(browser, result) {
      doneCount++;
      request.post(baseUrl).send({
          testName:result.description,
          testFramework:"Karma",
          fileName:result.suite,
          outcome:"Skipped",
          durationMilliseconds:result.time
      }).end(function(err, res){
          doneCount--;
          if(doneCount === 0 && doneCallback){
              doneCallback();
          }
      });
  }
  this.specFailure = function (browser, result) {
      doneCount++;
      request.post(baseUrl).send({
          testName:result.description,
          testFramework:"",
          fileName:result.suite,
          outcome:"Failed",
          durationMilliseconds:result.time,
          ErrorMessage:"",
          ErrorStackTrace:result.log ? result.log[0] : "",
      }).end(function(err, res){
          doneCount--;
          if(doneCount === 0 && doneCallback){
              doneCallback();
          }
      });
  }

  // wait for writing all the xml files, before exiting
  this.onExit = function (done) {
      if(doneCount===0){
        done();
      }else{
          doneCallback = done;
      }
  }
}

AppVeyorReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError']

// PUBLISH DI MODULE
module.exports = {
  'reporter:appveyor': ['type', AppVeyorReporter]
}