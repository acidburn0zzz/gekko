# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.0] 6-25-2019

- Track Jspare's Gekko documentation on [Github Wiki](https://github.com/jspare-projects/gekko/wiki) turning it easier to be maintained and updated.
- Add GET `/config` endpoint.
- Add Kubernetes support with Helm Chart.
- Add new subscription `backtestResult` from `backtestExporterResult` with registered handle `processBacktestResult`.
- Add new plugin `backtestAdapterExporter` to subscribe a `processBacktestResult`. 
- Add mongodb `processBacktestResult` consumer implementation.
- Add `Backtest Results` rest api exposed through `/backtests` allowing query and delete results already stored.
- Add `BacktestQuery` plugin for `mongodb`.
- Add api to generate combinations of backtest based on a specification of multiple possible values. 
- Add POST `/api/utils/backtests/combinations` endpoint to generate combinations.
- Add Workspaces synchornization based on Git.

## [0.6.8] - 6-11-2019

- Project forked from [@askmike/gekko](https://github.com/askmike/gekko).
