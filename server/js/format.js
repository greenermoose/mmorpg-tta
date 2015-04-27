var _ = require('underscore');
var Types = require('../../shared/js/gametypes');

(function () {
    FormatChecker = Class.extend({
        init: function () {
            this.formats = [];
            this.formats[Types.Messages.CREATE] = ['s', 's', 's'],
            this.formats[Types.Messages.LOGIN] = ['s', 's'],
            this.formats[Types.Messages.MOVE] = ['n', 'n'],
            this.formats[Types.Messages.LOOTMOVE] = ['n', 'n', 'n'],
            this.formats[Types.Messages.AGGRO] = ['n'],
            this.formats[Types.Messages.ATTACK] = ['n'],
            this.formats[Types.Messages.HIT] = ['n'],
            this.formats[Types.Messages.HURT] = ['n'],
            this.formats[Types.Messages.CHAT] = ['s'],
            this.formats[Types.Messages.LOOT] = ['n'],
            this.formats[Types.Messages.RANKING] = ['s'],
            this.formats[Types.Messages.TELEPORT] = ['n', 'n'],
            this.formats[Types.Messages.ZONE] = [],
            this.formats[Types.Messages.QUEST] = ['n', 's'],
            this.formats[Types.Messages.OPEN] = ['n'],
            this.formats[Types.Messages.CHECK] = ['n'],
            this.formats[Types.Messages.BOARD] = ['s', 'n', 'n'],
            this.formats[Types.Messages.BOARDWRITE] = ['s', 's', 's'],
            this.formats[Types.Messages.KUNG] = ['s'],
            this.formats[Types.Messages.MAGIC] = ['s', 's'],
            this.formats[Types.Messages.TALKTONPC] = ['n'],
            this.formats[Types.Messages.INVENTORY] = ['s', 'n', 'n'];
            this.formats[Types.Messages.SKILL] = ['s', 'n'];
            this.formats[Types.Messages.SKILLINSTALL] = ['n', 's'];
        },

        check: function (msg) {
            var message = msg.slice(0),
                type = message[0],
                format = this.formats[type];

            message.shift();

            if (format) {
                if (message.length !== format.length) {
                    return false;
                }
                for (var i = 0, n = message.length; i < n; i += 1) {
                    if (format[i] === 'n' && !_.isNumber(message[i])) {
                        return false;
                    }
                    if (format[i] === 's' && !_.isString(message[i])) {
                        return false;
                    }
                }
                return true;
            }
            else if (type === Types.Messages.WHO) {
                // WHO messages have a variable amount of params, all of which must be numbers.
                return message.length > 0 && _.all(message, function (param) { return _.isNumber(param); });
            }
            else if (type === Types.Messages.LOGIN) {
		// LOGIN
		return _.isString(message[0]) && _.isNumber(message[1]) && _.isNumber(message[2]) && (message.length == 3 || (_.isNumber(message[3]) && _.isString(message[4]) && message.length == 5) );
            } else {
                log.error('Unknown message type: ' + type);
                return false;
            }
        }
    });

    var checker = new FormatChecker();

    exports.check = checker.check.bind(checker);
})();
