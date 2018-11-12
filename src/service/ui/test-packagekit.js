#!/usr/bin/gjs
'use strict';

imports.gi.versions.Gtk = '3.0';
const Gtk = imports.gi.Gtk;

try {
  var PackageKit = imports.gi.PackageKitGlib;
  var _client = new PackageKit.Client();
} catch (e) {
  logError(e.name + ':' + e.message);
}

var progress_status = "";

class TestPackageKit {
  constructor() {
    this.application = new Gtk.Application();

    // Connect signals to callback function
    this.application.connect('startup', this._onStartup.bind(this));
    this.application.connect('activate', this._onStartup.bind(this));
  }

  _progress(progress, type, user_data) {
    const _up = String.fromCharCode(27).concat("[1A");
    const _right = String.fromCharCode(27).concat("[1D");
    const _erase = String.fromCharCode(27).concat("[2K");
    //print(_right.repeat(char_position) + _up + '.');

    var pct = progress.get_percentage().toString();
    pct = pct.padStart(4 - pct.length, " ") + "%";
    var new_status = PackageKit.status_enum_to_string(progress.get_status());
    var start = "";
    if (progress_status == new_status) {
      start = _up + _erase;
    } else {
      progress_status = new_status;
    }
    print(start + `${pct} ${new_status}`);
  }

  _onStartup() {
    var resolve, whatprovides;
    print("Starting tests...");
    try {
      resolve = _client.what_provides(
        PackageKit.filter_bitfield_from_string('arch;newest'),
        ['nautilus-python'], null, this._progress);
      resolve = resolve.get_package_array();
      whatprovides = _client.what_provides(
        PackageKit.filter_bitfield_from_string('arch;newest'),
        ['nautilus-python'], null, this._progress);
      whatprovides = whatprovides.get_package_array();
    } catch (e) {
      logError(e);
    }

    if (resolve.length == 0) {
      print('resolve: none');
    } else {
      print('resolve: ' + resolve.map(x => x.get_name()));
    }
    if (whatprovides.length == 0) {
      print('whatprovides: none');
    } else {
      print('whatprovides: ' + whatprovides.map(x => x.get_name()));
    }

    print('Done');
  }
};

// Run tests
let app = new TestPackageKit();
app.application.run(ARGV);
