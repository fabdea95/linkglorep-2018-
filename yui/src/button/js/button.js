// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_linkglorep
 * @copyright  COPYRIGHTINFO
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_linkglorep-button
 */

/**
 * Atto text editor linkglorep plugin.
 *
 * @namespace M.atto_linkglorep
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_linkglorep';
var KEYCONTROL = 'linkglorep_key';
var LOGNAME = 'atto_linkglorep';
var url = '';

var CSS = {
        INPUTSUBMIT: 'atto_media_urlentrysubmit',
        INPUTCANCEL: 'atto_media_urlentrycancel',
        KEYCONTROL: 'keycontrol'
    },
    SELECTORS = {
        KEYCONTROL: '.keycontrol'
    };

var TEMPLATE = '' +
    '<form class="atto_form">' +
        '<div id="{{elementid}}_{{innerform}}" class="mdl-align">' +
            '<label for="{{elementid}}_{{KEYCONTROL}}">{{get_string "enterkey" component}}</label>' +
            '<input class="{{CSS.KEYCONTROL}}" id="{{elementid}}_{{KEYCONTROL}}" name="{{elementid}}_{{KEYCONTROL}}" value="{{defaultkey}}" />' +
            '<button class="{{CSS.INPUTSUBMIT}}">{{get_string "insert" component}}</button>' +
        '</div>' +
        'icon: {{clickedicon}}'  +
    '</form>';

Y.namespace('M.atto_linkglorep').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {

    /**
     * Initialize the button
     *
     * @method Initializer
     */
    initializer: function() {
        // If we don't have the capability to view then give up.
        if (this.get('disabled')){
            return;
        }

        var icons = ['iconone'];

        Y.Array.each(icons, function(theicon) {
            // Add the linkglorep icon/buttons
            this.addButton({
                icon: 'ed/' + theicon,
                iconComponent: 'atto_linkglorep',
                buttonName: theicon,
                callback: this._displayDialogue,
                callbackArgs: theicon
            });
        }, this);

    },

    /**
     * Get the id of the key control where we store the keywords
     *
     * @method _getkeyControlName
     * @return {String} the name/id of the key form field
     * @private
     */
    _getkeyControlName: function(){
        return(this.get('host').get('elementid') + '_' + KEYCONTROL);
    },

     /**
     * Display the linkglorep Dialogue
     *
     * @method _displayDialogue
     * @private
     */
    _displayDialogue: function(e, clickedicon) {
        e.preventDefault();
        var width=400;


        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('dialogtitle', COMPONENTNAME),
            width: width + 'px',
            focusAfterHide: clickedicon
        });
		//dialog doesn't detect changes in width without this
		//if you reuse the dialog, this seems necessary
        if(dialogue.width !== width + 'px'){
            dialogue.set('width',width+'px');
        }

        //append buttons to iframe
        var buttonform = this._getFormContent(clickedicon);

        var bodycontent =  Y.Node.create('<div></div>');
        bodycontent.append(buttonform);

        //set to bodycontent
        dialogue.set('bodyContent', bodycontent);
        dialogue.show();
        this.markUpdated();
    },


     /**
     * Return the dialogue content for the tool, attaching any required
     * events.
     *
     * @method _getDialogueContent
     * @return {Node} The content to place in the dialogue.
     * @private
     */
    _getFormContent: function(clickedicon) {
        var template = Y.Handlebars.compile(TEMPLATE),
            content = Y.Node.create(template({
                elementid: this.get('host').get('elementid'),
                CSS: CSS,
                KEYCONTROL: KEYCONTROL,
                component: COMPONENTNAME,
                defaultkey: this.get('defaultkey'),
                //glorepurl: this.get('glorepurl'),
                clickedicon: clickedicon
            }));
       
        this._form = content;
        this._form.one('.' + CSS.INPUTSUBMIT).on('click', this._doInsert, this);
        return content;
    },

    /**
     * Inserts the users input onto the page
     * @method _getDialogueContent
     * @private
     */
    _doInsert : function(e){
        e.preventDefault();
        this.getDialogue({
            focusAfterHide: null
        }).hide();

        var keycontrol = this._form.one(SELECTORS.KEYCONTROL);
        
        url= this.get('glorepurl') + '/search/node/' + keycontrol.get('value');
        url= url.replace(' ',' OR ');
        // If no file is there to insert, don't do it.
        if (!keycontrol.get('value')){
            Y.log('No key control or value could be found.', 'warn', LOGNAME);
            return;
        }
        
        this.editor.focus();
        this.get('host').insertContentAtFocusPoint('<html><head><a href="'+ url +
                         '">trova repository per approfondire</a><br></head></html>');
        this.markUpdated();

    }
}, { ATTRS: {
		disabled: {
			value: false
		},

		usercontextid: {
			value: null
		},

		defaultkey: {
			value: ''
		},
                
                glorepurl: {
                        value: ''
               }
	}
});
