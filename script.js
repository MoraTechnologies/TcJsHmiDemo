(function (window) {

    var NETID = ""; // Empty string for local machine;
    var PORT = "851"; // PLC Runtime port;
    var SERVICE_URL = "/TcAdsWebService/TcAdsWebService.dll"; // HTTP path to the target TcAdsWebService;
    console.log("SERVICE URL: ", SERVICE_URL);

    // The TcAdsWebService.Client object for ajax communication with the TcAdsWebService;
    var client = new TcAdsWebService.Client(SERVICE_URL, null, null);

    var general_timeout = 500; // This timeout value is used for all requests;

    var readLoopID = null; // The id of the read interval; Can be used to stop the polling if need;
    var readLoopDelay = 100;

    var readSymbolValuesData = null; // This variable will store the Base64 encoded binary data string for the read sumcommando;

    // Array of symbol names to read;
    var handlesVarNames = [
            "MAIN.bStart",
            "MAIN.bStop",
            "MAIN.bStandby",
            "MAIN.bReset",
            "MAIN.bFault",
            "MAIN.nMotorSts"
        ];

    // Symbol handle variables;
    var hStart = null;
    var hStop = null;
    var hStandby = null;
    var hReset = null;
    var hFault = null;
    var hMotorSts = null;

    // Base64 encoded binary data strings for write requests;
    var TrueBase64 = null;
    var switchFalseBase64 = null;

    // UI Elements;
    var btnStart = null;
    var btnStop = null;
    var btnStandby = null;
    var btnReset = null;
    var motorBackground = null;
   

    // Occurs if the window has loaded;
    window.onload = (function () {

        // Initialize UI Elements;
        btnStart = document.getElementById("btnStart");
        btnStop = document.getElementById("btnStop");
        btnStandby = document.getElementById("btnStandby");
        btnReset = document.getElementById("btnReset");
        motorBackground = document.getElementById("motor-img");

        // Create event listeners for click functions
        btnStart.onclick = btnStartClick;
        btnStop.onclick = btnStopClick;
        btnStandby.onclick = btnStandbyClick;
        btnReset.onclick = btnResetClick;

        // Prepare data for writing to switch variable;
        var TrueBase64Writer = new TcAdsWebService.DataWriter();
        TrueBase64Writer.writeBOOL(true);
        TrueBase64 = TrueBase64Writer.getBase64EncodedData();

        // Create sumcommando for reading twincat symbol handles by symbol name;
        var handleswriter = new TcAdsWebService.DataWriter();

        // Write general information for each symbol handle to the TcAdsWebService.DataWriter object;
        for (var i = 0; i < handlesVarNames.length; i++) {
            handleswriter.writeDINT(TcAdsWebService.TcAdsReservedIndexGroups.SymbolHandleByName);
            handleswriter.writeDINT(0);
            handleswriter.writeDINT(4); // Expected size; A handle has a size of 4 byte;
            handleswriter.writeDINT(handlesVarNames[i].length); // The length of the symbol name string;
        }

        // Write symbol names after the general information to the TcAdsWebService.DataWriter object;
        for (var i = 0; i < handlesVarNames.length; i++) {
            handleswriter.writeString(handlesVarNames[i]);
        }

        // Send the list-read-write command to the TcAdsWebService by use of the readwrite function of the TcAdsWebService.Client object;
        client.readwrite(
            NETID,
            PORT,
            0xF082, // IndexGroup = ADS list-read-write command; Used to request handles for twincat symbols;
            handlesVarNames.length, // IndexOffset = Count of requested symbol handles;
            (handlesVarNames.length * 4) + (handlesVarNames.length * 8), // Length of requested data + 4 byte errorcode and 4 byte length per twincat symbol;
            handleswriter.getBase64EncodedData(),
            RequestHandlesCallback,
            null,
            general_timeout,
            RequestHandlesTimeoutCallback,
            true); // True for AJAX

    });

    // Occurs if the Start button is clicked;
    var btnStartClick = (function () {

        client.write(
            NETID,
            PORT,
            0x0000F005, // IndexGroup = Write variable by handle;
            hStart,
            TrueBase64,
            btnStartWriteCallback,
            null,
            general_timeout,
            btnStartWriteTimeoutCallback,
            true // True for AJAX
         );

    });

    // Occurs if the write request has finished;
    var btnStartWriteCallback = (function (e, s) {

        if (e && e.isBusy) {
            // HANDLE PROGRESS TASKS HERE;
            // Exit callback function because request is still busy;
            return;
        }

        if (e && !e.hasError) {
            // Success
        } else {

            if (e.error.getTypeString() == "TcAdsWebService.ResquestError") {
                // HANDLE TcAdsWebService.ResquestError HERE;
                console.log("bStart Write - Request Error");
            }
            else if (e.error.getTypeString() == "TcAdsWebService.Error") {
                // HANDLE TcAdsWebService.Error HERE;
                console.log("bStart - Other Error");
            }

        }

    });

    // Occurs if the writing of the value TRUE to bStart encounters timeout;
    var btnStartWriteTimeoutCallback = (function () {
        // Handle Timeout here;
        console.log("bStart - Writing to var timeout");
    });

    // Occurs if the Stop button is clicked;
    var btnStopClick = (function () {

        client.write(
            NETID,
            PORT,
            0x0000F005, // Write variable by handle;
            hStop,
            TrueBase64,
            btnStopWriteCallback,
            null,
            general_timeout,
            btnStopWriteTimeoutCallback,
            true // True for AJAX
         );

    });

    // Occurs if the write request has finished;
    var btnStopWriteCallback = (function (e, s) {

        if (e && e.isBusy) {
            // HANDLE PROGRESS TASKS HERE;
            // Exit callback function because request is still busy;
            return;
        }

        if (e && !e.hasError) {
            // Success
        } else {

            if (e.error.getTypeString() == "TcAdsWebService.ResquestError") {
                // HANDLE TcAdsWebService.ResquestError HERE;
                console.log("bStop - Request Error");
            }
            else if (e.error.getTypeString() == "TcAdsWebService.Error") {
                // HANDLE TcAdsWebService.Error HERE;
                console.log("bStop - Other Error");
            }

        }

    });

    // Occurs if the writing of the value TRUE to bStop encounters timeout;
    var btnStopWriteTimeoutCallback = (function () {
        // Handle Timeout here;
        console.log("bStop - Writing to var timeout");
    });

    // Occurs if the Standby button is clicked;
    var btnStandbyClick = (function () {

        client.write(
            NETID,
            PORT,
            0x0000F005, // Write variable by handle;
            hStandby,
            TrueBase64,
            btnStandbyWriteCallback,
            null,
            general_timeout,
            btnStandbyWriteTimeoutCallback,
            true // True for AJAX
         );

    });

    // Occurs if the write request has finished;
    var btnStandbyWriteCallback = (function (e, s) {

        if (e && e.isBusy) {
            // HANDLE PROGRESS TASKS HERE;
            // Exit callback function because request is still busy;
            return;
        }

        if (e && !e.hasError) {
            // Success
        } else {

            if (e.error.getTypeString() == "TcAdsWebService.ResquestError") {
                // HANDLE TcAdsWebService.ResquestError HERE;
                console.log("bStandby - Request Error");
            }
            else if (e.error.getTypeString() == "TcAdsWebService.Error") {
                // HANDLE TcAdsWebService.Error HERE;
                console.log("bStandby - Other Error");
            }

        }

    });

    // Occurs if the writing of the value TRUE to bStandby encounters timeout;
    var btnStandbyWriteTimeoutCallback = (function () {
        // Handle Timeout here;
        console.log("bStandby - Writing to var timeout");
    });

    // Occurs if the Reset button is clicked;
    var btnResetClick = (function () {

        client.write(
            NETID,
            PORT,
            0x0000F005, // Write variable by handle;
            hReset,
            TrueBase64,
            btnResetWriteCallback,
            null,
            general_timeout,
            btnResetWriteTimeoutCallback,
            true // True for AJAX
         );

    });

    // Occurs if the write request has finished;
    var btnResetWriteCallback = (function (e, s) {

        if (e && e.isBusy) {
            // HANDLE PROGRESS TASKS HERE;
            // Exit callback function because request is still busy;
            return;
        }

        if (e && !e.hasError) {
            // Success
        } else {

            if (e.error.getTypeString() == "TcAdsWebService.ResquestError") {
                // HANDLE TcAdsWebService.ResquestError HERE;
                console.log("bReset - Request Error");
            }
            else if (e.error.getTypeString() == "TcAdsWebService.Error") {
                // HANDLE TcAdsWebService.Error HERE;
                console.log("bReset - Other Error");
            }

        }

    });

    // Occurs if the writing of the value TRUE to bStandby encounters timeout;
    var btnResetWriteTimeoutCallback = (function () {
        // Handle Timeout here;
        console.log("bReset - Writing to var timeout");
    });

    // Occurs if the readwrite for the sumcommando has finished;
    var RequestHandlesCallback = (function (e, s) {

        if (e && e.isBusy) {
            // HANDLE PROGRESS TASKS HERE;
            // Exit callback function because request is still busy;
            return;
        }

        if (e && !e.hasError) {

            // Get TcAdsWebService.DataReader object from TcAdsWebService.Response object;
            var reader = e.reader;

            // Read error code and length for each handle;
            for (var i = 0; i < handlesVarNames.length; i++) {

                var err = reader.readDWORD();
                var len = reader.readDWORD();

                if (err != 0) {
                    // HANDLE SUMCOMMANDO ERRORS HERE;
                    console.log("SUMCOMMANDO- DataReader object Error: ", err);
                    return;
                }

            }

            // Read handles from TcAdsWebService.DataReader object;
            hStart = reader.readDWORD();
            hStop = reader.readDWORD();
            hStandby = reader.readDWORD();
            hReset = reader.readDWORD();
            hFault = reader.readDWORD();
            hMotorSts = reader.readDWORD();

            // Create sum commando to read symbol values based on the handle;
            var readSymbolValuesWriter = new TcAdsWebService.DataWriter();

            //  "MAIN.bStart" // BOOL
            readSymbolValuesWriter.writeDINT(TcAdsWebService.TcAdsReservedIndexGroups.SymbolValueByHandle); // IndexGroup
            readSymbolValuesWriter.writeDINT(hStart); // IndexOffset = The target handle
            readSymbolValuesWriter.writeDINT(1); // Size to read;

            //  "MAIN.bStop" // BOOL
            readSymbolValuesWriter.writeDINT(TcAdsWebService.TcAdsReservedIndexGroups.SymbolValueByHandle); // IndexGroup
            readSymbolValuesWriter.writeDINT(hStop); // IndexOffset = The target handle
            readSymbolValuesWriter.writeDINT(1); // Size to read;

            //  "MAIN.bStandby" // BOOL
            readSymbolValuesWriter.writeDINT(TcAdsWebService.TcAdsReservedIndexGroups.SymbolValueByHandle); // IndexGroup
            readSymbolValuesWriter.writeDINT(hStandby); // IndexOffset = The target handle
            readSymbolValuesWriter.writeDINT(1); // Size to read;

            //  "MAIN.bReset" // BOOL
            readSymbolValuesWriter.writeDINT(TcAdsWebService.TcAdsReservedIndexGroups.SymbolValueByHandle); // IndexGroup
            readSymbolValuesWriter.writeDINT(hReset); // IndexOffset = The target handle
            readSymbolValuesWriter.writeDINT(1); // Size to read;

            //  "MAIN.bFault" // BOOL
            readSymbolValuesWriter.writeDINT(TcAdsWebService.TcAdsReservedIndexGroups.SymbolValueByHandle); // IndexGroup
            readSymbolValuesWriter.writeDINT(hFault); // IndexOffset = The target handle
            readSymbolValuesWriter.writeDINT(1); // Size to read;

            //  "MAIN.nMotorSts" // INT
            readSymbolValuesWriter.writeDINT(TcAdsWebService.TcAdsReservedIndexGroups.SymbolValueByHandle); // IndexGroup
            readSymbolValuesWriter.writeDINT(hMotorSts); // IndexOffset = The target handle
            readSymbolValuesWriter.writeDINT(2); // Size to read;

            // Get Base64 encoded data from TcAdsWebService.DataWriter;
            readSymbolValuesData = readSymbolValuesWriter.getBase64EncodedData();

            // Start cyclic reading of symbol values;
            readLoopID = window.setInterval(ReadLoop, readLoopDelay);

        } else {

            if (e.error.getTypeString() == "TcAdsWebService.ResquestError") {
                // HANDLE TcAdsWebService.ResquestError HERE;
                console.log("Reader - Request Error");
            }
            else if (e.error.getTypeString() == "TcAdsWebService.Error") {
                // HANDLE TcAdsWebService.Error HERE;
                console.log("Reader - Other Error");
            }

        }

    });

    // Occurs if the readwrite for the sumcommando to request symbol handles runs into timeout;
    var RequestHandlesTimeoutCallback = (function () {
        // Handle Timeout here;
        console.log("SUMCOMMANDO - Request handles timeout")
    });

    // Interval callback for cyclic reading;
    var ReadLoop = (function () {

        // Send the read-read-write command to the TcAdsWebService by use of the readwrite function of the TcAdsWebService.Client object;
        client.readwrite(
            NETID,
            PORT,
            0xF080, // 0xF080 = Read command;
            handlesVarNames.length, // IndexOffset = Variables count;
            7 + (handlesVarNames.length * 4), // Length of requested data + 4 byte errorcode per variable;
            readSymbolValuesData,
            ReadCallback,
            null,
            general_timeout,
            ReadTimeoutCallback,
            true);

    });

    // Occurs if the read-read-write command has finished;
    var ReadCallback = (function (e, s) {

        if (e && e.isBusy) {
            // HANDLE PROGRESS TASKS HERE;
            // Exit callback function because request is still busy;
            return;
        }

        if (e && !e.hasError) {

            var reader = e.reader;

            // Read error codes from begin of TcAdsWebService.DataReader object;
            for (var i = 0; i < handlesVarNames.length; i++) {
                var err = reader.readDWORD();
                if (err != 0) {
                    // HANDLE SUMCOMMANDO ERRORS HERE;
                    console.log("SUMCOMMANDO - ReadLoop - ReadCallback Error: ", err);
                    return;
                }
            }

            // READ Symbol data from TcAdsWebService.DataReader object;
            //  "MAIN.bStart" // BOOL
            var Start = reader.readBOOL();
            //  "MAIN.bStop" // BOOL
            var Stop = reader.readBOOL();
            //  "MAIN.bStandby" // BOOL
            var Standby = reader.readBOOL();
            //  "MAIN.bReset" // BOOL
            var Reset = reader.readBOOL();
            //  "MAIN.bFault" // BOOL
            var Fault = reader.readBOOL();
            //  "MAIN.nMotorSts" // INT
            var MotorSts = reader.readINT();

            // Update UI
            // Motor Background Color
            if (MotorSts == 0 ) {
                motorBackground.style.backgroundColor = 'DarkGray'; 
            } else if (MotorSts == 1) {
                motorBackground.style.backgroundColor = 'Chartreuse';
            } else if (MotorSts == 2) {
                motorBackground.style.backgroundColor = 'DodgerBlue';
            } else if (MotorSts == 3) {
                motorBackground.style.backgroundColor = 'Red';
            }

        } else {

            if (e.error.getTypeString() == "TcAdsWebService.ResquestError") {
                // HANDLE TcAdsWebService.ResquestError HERE;
                console.log("ReadCallback - Request Error");
            }
            else if (e.error.getTypeString() == "TcAdsWebService.Error") {
                // HANDLE TcAdsWebService.Error HERE;
                console.log("ReadCallback - Other Error");
            }
        }

    });

    // Occurs if the read-read-write command runs into timeout;
    var ReadTimeoutCallback = (function () {
        // Handle Timeout here;
        console.log("ReadTimeOutCallback - Error");
    });

    // Occurs if the release symbol handle request has finished;
    var FreeHandleCallback = (function (e, s) {

        if (e && e.isBusy) {
            // HANDLE PROGRESS TASKS HERE;
            // Exit callback function because request is still busy;
            return;
        }

        if (e && !e.hasError) {
            // Success
        } else {

            if (e.error.getTypeString() == "TcAdsWebService.ResquestError") {
                // HANDLE TcAdsWebService.ResquestError HERE;
                console.log("FreeHandleCallback - Request Error");
            }
            else if (e.error.getTypeString() == "TcAdsWebService.Error") {
                // HANDLE TcAdsWebService.Error HERE;
                console.log("FreeHandleCallback - Other Error");
            }
        }

    });

    // Occurs if the release symbol handle request runs into timeout;
    var FreeHandleTimeoutCallback = (function () {
        // Handle Timeout here;
        alert("timeout");
    });

    // Occurs if the browser window or tab is closed;
    //  IndexGroup 0xF006 = Release Symbol Handle;
    //  IndexOffset = Symbol handle;
    window.onbeforeunload = (function () {

        // Free Handles
        client.write(NETID, PORT, 0xF006, hStart, "", FreeHandleCallback, "hStart", general_timeout, FreeHandleTimeoutCallback, true);
        client.write(NETID, PORT, 0xF006, hStop, "", FreeHandleCallback, "hStop", general_timeout, FreeHandleTimeoutCallback, true);
        client.write(NETID, PORT, 0xF006, hStandby, "", FreeHandleCallback, "hStandby", general_timeout, FreeHandleTimeoutCallback, true);
        client.write(NETID, PORT, 0xF006, hReset, "", FreeHandleCallback, "hReset", general_timeout, FreeHandleTimeoutCallback, true);
        client.write(NETID, PORT, 0xF006, hFault, "", FreeHandleCallback, "hFault", general_timeout, FreeHandleTimeoutCallback, true);
        client.write(NETID, PORT, 0xF006, hMotorSts, "", FreeHandleCallback, "hMotorSts", general_timeout, FreeHandleTimeoutCallback, true);

    });

})(window);