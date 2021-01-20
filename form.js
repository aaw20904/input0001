function DataFieldBlock (idOfStep, regExpTest) {
  var itemId = idOfStep;
  var testRegEx = regExpTest;
  var autocompleteArray = null;
  var callbackFunc = null;
  /* instances of classes */
  var promptDispatcher = new PromptEventDispatcher(itemId);
  var promptDomMgr = new InpPromptDomMgr(itemId);
  var errClear; // an error clearer
  /* get a concrete node with step */
  var nodeItem = document.querySelector(`[data-form-item=${itemId}]`);
  if (!nodeItem) {
    return null;
  }
  errClear = new ErrorClear(nodeItem, 'err');
  errClear.init();
  var inputNode = nodeItem.querySelector(`#${itemId}`);
  /* apply a pattern to an HTML input */
  inputNode.setAttribute('pattern', testRegEx.source);
  /* function for pasting a prompt into html INPUT */
  function pastePromptIntoInput (promptTxt) {
    inputNode.value = promptTxt;
  }

  /* when user press tab */
  function onTab (evt) {

  }
  /* keyboard event handler */
  function onInput (event) {
    var tmp;
    var promptArray;
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    /* get text from input */
    tmp = event.currentTarget.value;
    /* calculate a promptArray */
    promptArray = DataFieldBlock.prototype.autocompleteMatching(tmp, autocompleteArray);
    /* unbind event handler before refreshing DOM three */
    promptDispatcher.unbindNodeEvents();
    /* assign to prompt three */
    promptDomMgr.updatePrompt(promptArray);
    /* if an array isn`t empty - bind event handler */
    if (promptArray.length > 0) {
      promptDispatcher.bindNodeEvents();
    }
  }
  /* event mouse handler - button "Next.." */
  function eventHandlerNext (evt) {
    var result = {};
    var errorWindow = nodeItem.querySelector('.labelWrp');
    errorWindow = errorWindow.querySelector('.err');
    /* get text */
    var txt = inputNode.value;
    /* 1)check is an input valid */
    if (inputNode.checkValidity()) {
      /* if a value correct - call a callback
            and pass a result */
      result[idOfStep] = txt;
      callbackFunc(result);
      errorWindow.innerText = '';
    } else {
      /* othervise set error */
      errorWindow.innerText = 'Wrong data!';
    }
  }

  /* function on init:
    bind buttons to event handler */
  function onInit (nodeI, fEvent, id) {
    var btn = nodeI.querySelector(`[data-btn=${id}]`);
    btn.addEventListener('click', fEvent, false);
    /* bind to input */
    promptDispatcher.regCallback(pastePromptIntoInput);
  }

  onInit(nodeItem, eventHandlerNext, itemId);

  return {

    /* this "callback" function will have called after click and handling info
    - to pass result */
    callbackRegister: function (f) {
      callbackFunc = f;
    },
    /* show/hide an item */
    show: function (b) {
      if (b) {
        nodeItem.style.display = 'flex';
      } else {
        nodeItem.style.display = '';
      }
    },
    /* set an autocomplete array */
    setAutocompleArray: function (a) {
      autocompleteArray = a;
      /**/
    },
    initAutocomplete: function () {
      if (autocompleteArray) {
        /* add listener to "input" event of HTML input */
        inputNode.addEventListener('input', onInput, false);
        /* show prompt */
        promptDomMgr.updatePrompt(autocompleteArray);
        promptDispatcher.bindNodeEvents();
      }
    },
    setTest: function (reg) {
      /* assign a new regexp */
      testRegEx = reg;
      /* apply a pattern to an HTML input */
      inputNode.setAttribute('pattern', testRegEx.source);
    }

  };
}
/* an autocomplete function */
DataFieldBlock.prototype.autocompleteMatching = function (inp, templateArray) {
  var result = [];
  var tmp;
  /* create a regular expression for test */
  var reg = new RegExp(`(${inp})`);
  var wordSeparator = /\w+/;
  /* iterate an array */
  templateArray.forEach(function (value) {
    /* select a first word */
    tmp = wordSeparator.exec(value)[0];
    if (reg.test(tmp)) {
      /* if there was a match - copy to result
           a pice of template */
      result.push(value);
    }
  });
  return result;
};

/** **Data sender***************/
function DataSenderBlock (nodeAttrId) {
  var attr = nodeAttrId;
  var senderNode = document.querySelector(`[data-form-item=${attr}]`);
  var senderFunc = null;
  /* is a node exists? */
  if (!senderNode) {
    return null;
  }
  var btnNode = senderNode.querySelector(`[data-btn=${attr}]`);
  /* a function for locking a button *send*  */
  function lockBtn (pnode) {
    var bnode = pnode.querySelector(`[data-btn=${attr}]`);
    var image = pnode.querySelector('.progressWrap');
    image = image.querySelector('img');
    image.setAttribute('src', 'finish.svg');
    bnode.disabled = true;
    bnode.setAttribute('class', '');
    bnode.style.cursor = 'auto';
    bnode.innerText = 'Thanks for the registration!';
  }
  /* a click event handler */
  function onClick (msg) {
    senderFunc('@echo');
    /* disable the button */
    lockBtn(senderNode);
  }

  return {
    regCallback: function (f) {
      senderFunc = f;
      btnNode.addEventListener('click', onClick, false);
    },
    show: function (flag) {
      if (flag) {
        senderNode.style.display = 'flex';
      } else {
        senderNode.style.display = '';
      }
    }
  };
}

/** *expiremental function for matching**/
function autocompleteMatching (inp, templateArray) {
  var result = [];
  var tmp;
  /* create a regular expression for test */
  var reg = new RegExp(`(${inp})`);
  var wordSeparator = /\w+/;
  /* iterate an array */
  templateArray.forEach(function (value) {
    /* select a first word */
    tmp = wordSeparator.exec(value)[0];
    if (reg.test(tmp)) {
      /* if there was a match - copy to result
           a pice of template */
      result.push(value);
    }
  });
  return result;
}

/* input prompt */
function InpPromptDomMgr (pAttr) {
  var parentAttrib = pAttr;
  /* get parent block */
  var pNode = document.querySelector(`[data-form-item=${pAttr}]`);
  /* checking -is a node exists? */
  if (!pNode) {
    return null;
  }
  /* get a list */
  var list = pNode.querySelector('.prompt');

  function clickHandler (evt) {

  }

  return {

    updatePrompt (arrayOfStrings) {
      var tmp;
      var itemsOfUl = list.children;
      /* converting to an array */
      itemsOfUl = Array.prototype.slice.call(itemsOfUl);
      /* remove children - clear a list */
      itemsOfUl.forEach(function (val) {
        list.removeChild(val);
      });

      /* assign new children */
      arrayOfStrings.forEach(function (val) {
        /* create a new node */
        tmp = document.createElement('li');
        /* assign text */
        tmp.innerText = val;
        /* assign to a parent */
        list.appendChild(tmp);
      });
      /* is it an empty list? */
      if (list.children.length === 0) {
        list.style.display = '';
      } else {
        list.style.display = 'flex';
      }
    }
  };
}

/**********
promptEvent dispatcher */

function PromptEventDispatcher (nodeAttr) {
  var pAttr = nodeAttr;
  var empty = true;
  var indexOfItem = 0;
  var lengthOfItem = 0;
  /* get a parent node and a list item */
  var pNode = document.querySelector(`[data-form-item=${nodeAttr}]`);
  var listN = pNode.querySelector('.prompt');
  /* get an input node */
  var inputNode = pNode.querySelector(`#${pAttr}`);
  var callback = null;
  /* on key down handler */
  function onKey (event) {
    var tmp;
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    /* clear an error node */
    PromptEventDispatcher.prototype.clearErrorNode(pNode);

    switch (event.key) {
      case 'Down': // IE/Edge specific value
      case 'ArrowDown':
        if (listN.style.display === '') {
          listN.style.display = 'flex';
        }
        if (indexOfItem < listN.children.length) {
          /* clear last item */
          if (indexOfItem > 0) {
            listN.children[indexOfItem - 1].style.backgroundColor = '';
          }
          /* set a current item */
          listN.children[indexOfItem].style.backgroundColor = 'red';
          /* get text */
          tmp = listN.children[indexOfItem].innerText;
          /* run a callback and pass a parameter */
          callback(tmp);
          indexOfItem++;
        }

        break;
      case 'Up': // IE/Edge specific value
      case 'ArrowUp':
        if (listN.style.display === '') {
          listN.style.display = 'flex';
        }
        if (indexOfItem > 0) {
          /* clear last item */
          if (indexOfItem < listN.children.length) {
            listN.children[indexOfItem].style.backgroundColor = '';
          }
          /* set a current item */
          listN.children[indexOfItem - 1].style.backgroundColor = 'red';
          /* get text */
          tmp = listN.children[indexOfItem - 1].innerText;
          /* run a callback and pass a parameter */
          callback(tmp);
          indexOfItem--;
        }

        break;
      case 'Enter':
        listN.style.display = '';
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  }
  /* mouse event handler */
  function onMouseEvent (evt) {
    if (callback) {
      callback(evt.currentTarget.innerText);
      PromptEventDispatcher.prototype.clearErrorNode(pNode);
    }
  }

  return {
    bindNodeEvents: function () {
      /* get a list */
      var elems = listN.children;
      elems = Array.prototype.slice.call(elems);

      /* bind each item to an event handler */
      elems.forEach(function (val) {
        val.addEventListener('click', onMouseEvent, false);
      });
      /* checking - is a list empty? */
      if (elems.length === 0) {
        empty = true;
      } else {
        /* add a key press handler */
        inputNode.addEventListener('keydown', onKey, true);
        empty = false;
      }
    },
    unbindNodeEvents: function () {
      /* get a list */
      var elems = listN.children;
      elems = Array.prototype.slice.call(elems);
      /* unbind buttons */
      elems.forEach(function (val) {
        val.removeEventListener('click', onMouseEvent);
      });
      /* add a key press handler */
      inputNode.removeEventListener('keydown', onKey);
      /* set an empty flag */
      empty = true;
    },

    regCallback: function (f) {
      callback = f;
    }
  };
}

PromptEventDispatcher.prototype.clearErrorNode = function (pNode) {
  var errNode = pNode.querySelector('.err');
  errNode.innerText = '';
};

/** *error clear**/
function ErrorClear (pNode, errClass) {
  var parent = pNode;
  var errNode = parent.querySelector('.' + errClass);
  /* if a node isn`t exists */
  if (!errNode) {
    return null;
  }
  var input = parent.querySelector('input');

  function onChange (evt) {
    if (evt.currentTarget.checkValidity()) {
      errNode.innerText = '';
    }
  }
  return {
    init: function () {
      /* add  an event listener - on change */
      input.addEventListener('keyup', onChange, false);
    }

  };
}

/** ***form mgr*******/
function FormMgr () {
  /* define template arrays */
  var indexOfItem = 0;
  var dataFromBlock = {};
  var arrayOfitems = [];
  var dataSender = new DataSenderBlock('done');
  var countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Anguilla', 'Antigua &amp; Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia &amp; Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central Arfrican Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Cook Islands', 'Costa Rica', 'Cote D Ivoire', 'Croatia', 'Cuba', 'Curacao', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Polynesia', 'French West Indies', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauro', 'Nepal', 'Netherlands', 'Netherlands Antilles', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russia', 'Rwanda', 'Saint Pierre &amp; Miquelon', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'St Kitts &amp; Nevis', 'St Lucia', 'St Vincent', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', "Timor L'Este", 'Togo', 'Tonga', 'Trinidad &amp; Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks &amp; Caicos', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States of America', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Virgin Islands (US)', 'Yemen', 'Zambia', 'Zimbabwe'];
  var jobs = {
    sales: ['sales manager', 'saler', 'director'],
    logistik: ['picker', 'manager', 'storekeeper'],
    transport: ['manager', 'driver A', 'driver B', 'driver C', 'driver D', 'train driver'],
    building: ['builder', 'carpenter', 'bricklayer', 'electrican', 'plumber', 'plasterer', 'crane operator', 'estimator'],
    aviation: ['pilot', 'aviadispatcher', 'bortprovodnik', 'manager'],
    engeneering: ['service engeneer', 'engeneer', 'architect']
  };

  dataSender.regCallback(sendToServerImmitationPlug);
  arrayOfitems[0] = new DataFieldBlock('name', /(\S+)\s(\S+)/);
  arrayOfitems[1] = new DataFieldBlock('country', /([A-Za-z])\w+/);
  arrayOfitems[2] = new DataFieldBlock('age', /(\d)\w+/);
  arrayOfitems[3] = new DataFieldBlock('job_area', /([A-Za-z])\w+/);
  arrayOfitems[4] = new DataFieldBlock('specifity', /([A-Za-z])\w+/);
  arrayOfitems[5] = new DataFieldBlock('experience', /(\d)/);
  arrayOfitems[6] = new DataFieldBlock('email', /([A-Za-z])\w+(@)([a-z])\w+(.)([a-z])\w+/);

  /* bind to callback function. It picks results
    from all the items */
  arrayOfitems.forEach(function (val) {
    val.callbackRegister(onCompletion);
  });
  /* plug - interface */
  function sendToServerImmitationPlug (info) {
    var res = JSON.stringify(dataFromBlock);
    alert(res);
  }

  /* show the first item */
  arrayOfitems[0].show(true);
  /* a scenery for data collecting */
  function onCompletion (res) {
    var key = Object.keys(res)[0];
    dataFromBlock[key] = res[key];
    /* hide previous */
    arrayOfitems[indexOfItem].show(false);
    indexOfItem++;
    /** turn on autocomplete */
    switch (indexOfItem) {
      /* init and turn on au-
            tocomplete */
      case 1:
        /* country */
        arrayOfitems[indexOfItem].setAutocompleArray(countries);
        arrayOfitems[indexOfItem].setTest(FormMgr.prototype.arrayToReg(countries));
        arrayOfitems[indexOfItem].initAutocomplete();
        break;
      case 3:
        /* job area */
        arrayOfitems[indexOfItem].setAutocompleArray(Object.keys(jobs));
        arrayOfitems[indexOfItem].setTest(FormMgr.prototype.arrayToReg(Object.keys(jobs)));
        arrayOfitems[indexOfItem].initAutocomplete();
        break;
      case 4:
        /* specifity */
        var txst001 = dataFromBlock.job_area;
        txst001 = jobs[txst001];
        arrayOfitems[indexOfItem].setAutocompleArray(txst001);
        arrayOfitems[indexOfItem].setTest(FormMgr.prototype.arrayToReg(txst001));
        arrayOfitems[indexOfItem].initAutocomplete();
        break;
      default:
    }

    if (indexOfItem > 6) {
      /* if the end of array has been achived */
      dataSender.show(true);
      return;
    }
    /* show current */
    arrayOfitems[indexOfItem].show(true);
  }

  var sender = new DataSenderBlock('done');

  return {
    setIndex: function (x) {
      indexOfItem = x;
    }
  };
}

FormMgr.prototype.arrayToReg = function (inpVal) {
  var res = '';
  inpVal.forEach(function (val) {
    res += val + '|';
  });
  return new RegExp(res);
};

function testConsole (i) {
  console.info(i);
}

var testArray = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Anguilla', 'Antigua &amp; Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia &amp; Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central Arfrican Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Cook Islands', 'Costa Rica', 'Cote D Ivoire', 'Croatia', 'Cuba', 'Curacao', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Polynesia', 'French West Indies', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauro', 'Nepal', 'Netherlands', 'Netherlands Antilles', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russia', 'Rwanda', 'Saint Pierre &amp; Miquelon', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'St Kitts &amp; Nevis', 'St Lucia', 'St Vincent', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', "Timor L'Este", 'Togo', 'Tonga', 'Trinidad &amp; Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks &amp; Caicos', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States of America', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Virgin Islands (US)', 'Yemen', 'Zambia', 'Zimbabwe'];
var sender001;
var tstItem01;
var msgMngr;
var item0001;
window.onload = function () {
  tstItem01 = new FormMgr();

  /*   item0001 = new DataFieldBlock('name',/([A-Z])([a-z])\w+/);
        item0001.callbackRegister(testConsole);
        item0001.setAutocompleArray(testArray);
        item0001.initAutocomplete(); */
};
