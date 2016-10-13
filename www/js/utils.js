angular.module('starter.utils', [])
        .factory('utils', function () {

            var monthList = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

            return {
                printDate: function (str) {

                    var today = new Date();
                    var dd = pad(today.getDate(), 2);
                    var mm = pad(today.getMonth() + 1, 2); //January is 0!
                    var yyyy = today.getFullYear();
                    var h = today.getHours();
                    var m = today.getMinutes();

                    var day, month, year, hours, minutes;

                    // Split timestamp into [ Y, M, D, h, m, s ]
                    var t = str.split(/[- :]/);

                    day = t[2];
                    month = t[1];
                    year = t[0];
                    hours = t[3];
                    minutes = t[4];

                    //console.log(str, day+"-"+month+"-"+year+" "+hours+":"+minutes);

                    if (year == yyyy && month == mm) {
                        if (day == dd && hours == h && (m - minutes) <= 5)
                            return "Adesso";
                        if (day == dd && hours == h && (m - minutes) > 5 && (m - minutes) <= 59)
                            return (m - minutes) + " minuti fa";
                        if (day == dd && (h - hours) == 1)
                            return "1 ora fa";
                        if (day == dd && (h - hours) > 1 && (h - hours) <= 3)
                            return (h - hours) + " ore fa";
                        if (day == dd && (h - hours) > 3)
                            return "Oggi alle " + hours + ":" + minutes;
                        if (day == (dd - 1))
                            return "Ieri alle " + hours + ":" + minutes;
                    }

                    return day + " " + monthList[parseInt(month) - 1] + " alle " + hours + ":" + minutes;
                },
                dateFromStr: function (str) {
                    return new Date(str);
                },
                dateFromSistemaPugliaStr: function (str) {
                    var t = str.split(/[- :]/);
                    return new Date(t[2] + '-' + t[1] + '-' + t[0] + 'T' + t[3] + ':' + t[4]);
                },
                pad: function (num, size) {
                    var s = num + "";
                    while (s.length < size)
                        s = "0" + s;
                    return s;
                },
                dateDiff: function (date1, date2, type) {
                    if (!type)
                        type = "mins";
                    var diffMs = (date1 - date2); // milliseconds between date1 and date2

                    var diffDays = Math.round(diffMs / 86400000); // days
                    var diffHours = Math.round(diffMs / 3600000); // hours
                    var diffMins = Math.round(diffMs / 60000); // minutes

                    switch (type) {
                        case 'mins':
                            diffMins;
                            break;
                        case 'hours':
                            diffHours;
                            break;
                        case 'days':
                            diffDays;
                            break;
                        default:
                            diffMins;
                            break;
                    }

                    return diffMins;
                },
                // str = mm/yyyy
                monthFormat: function (str) {
                    var t = str.split('/');
                    return monthList[parseInt(t[0]) - 1] + " " + t[1];
                },
                // str = dd/mm/yyyy
                dateFormat: function (str) {
                    var t = str.split('/');
                    return parseInt(t[0]) + " " + monthList[parseInt(t[1]) - 1] + " " + t[2];
                },
                // str = dd/mm/yyyy
                datetimeFormat: function (str) {
                    var t = str.split(/[- :]/);
                    return parseInt(t[0]) + " " + monthList[parseInt(t[1]) - 1] + " " + t[2] + " " + t[3] + ":" + t[4] + ":" + t[5];
                },
                convertNews: function (item) {
                    var obj = {};
                    obj.id_news = item.id;
                    obj.title = item.titolo;
                    obj.image_url = item.immagine;
                    obj.date = item.data;
                    obj.content = item.descrizione;
                    obj.link = item.link;
                    
                    return obj;
                }
            };
            function pad(num, size) {
                var s = num + "";
                while (s.length < size)
                    s = "0" + s;
                return s;
            }
        }
        )
        ;