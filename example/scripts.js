import CordovaPlugin from "../plugins/cordova/index.mjs"
import auth0 from "../src/index.js";

var htmlConsole = new HTMLConsole({
    selector: '#console'
});

var REDIRECT_URL = window.location.origin;

var webAuth;
var webAuthPasswordless;
var organization;

function setConfig() {
    var $domainInput = $('#config-domain');
    var $clientIdInput = $('#config-client-id');
    var $clientIdPwl = $('#config-client-id-pwl');
    var $userEmailInput = $('#config-user-email');
    var $userPwdInput = $('#config-user-password');
    var $configOrganization = $('#config-organization');

    var domain =
    $domainInput.val() ||
    Cookies.get('auth0_domain') ||
    'brucke.auth0.com';
    var clientId =
    $clientIdInput.val() ||
    Cookies.get('auth0_client_id') ||
    'k5u3o2fiAA8XweXEEX604KCwCjzjtMU6';
    var clientIdPwl =
    $clientIdPwl.val() ||
    Cookies.get('auth0_client_id_pwl') ||
    'VZUvmnj3pd9yNgq8BjX4YA8Km14jQ0PN';
    var userEmail =
    $userEmailInput.val() ||
    Cookies.get('auth0_user_email') ||
    'johnfoo@gmail.com';
    var userPass =
    $userPwdInput.val() || Cookies.get('auth0_user_pw') || '1234';
    var configOrganization =
    $configOrganization.val() ||
    Cookies.get('auth0_config_organization') ||
    undefined;

    var webAuthConfig = {
    domain: domain,
    redirectUri: REDIRECT_URL,
    clientID: clientId,
    // plugins: [new CordovaPlugin()],
    scope: 'openid email',
    responseType: 'code'
    };

    webAuth = new auth0.WebAuth(webAuthConfig);

    webAuthPasswordless = new auth0.WebAuth({
    domain: domain,
    redirectUri: REDIRECT_URL,
    clientID: clientIdPwl,
    responseType: 'token'
    });

    Cookies.set('auth0_domain', domain);
    Cookies.set('auth0_client_id', clientId);
    Cookies.set('auth0_client_id_pwl', clientIdPwl);
    Cookies.set('auth0_user_email', userEmail);
    Cookies.set('auth0_user_pw', userPass);

    if (configOrganization) {
    Cookies.set('auth0_config_organization', configOrganization);
    organization = configOrganization;
    }

    $domainInput.val(domain);
    $clientIdInput.val(clientId);
    $clientIdPwl.val(clientIdPwl);

    if (configOrganization) {
    $configOrganization.val(configOrganization);
    }

    $('.update-user-email').each(function (index, el) {
    $(el).val(userEmail);
    });

    $('.update-user-password').each(function (index, el) {
    $(el).val(userPass);
    });
}

setConfig();

webAuth.parseHash(function (err, data) {
    console.log(err, data);
    if (err) {
    htmlConsole.dumpCallback(err);
    window.location.hash = '';
    return;
    }

    if (data) {
    htmlConsole.dumpCallback(null, data);

    if (data.accessToken) {
        webAuth.client.userInfo(
        data.accessToken,
        htmlConsole.dumpCallback.bind(htmlConsole)
        );
    }
    }

    window.location.hash = '';
});

$('#clear-console').click(function () {
    $('#clear-console').removeClass('icon-budicon-498');
    $('#clear-console').addClass('icon-budicon-495');

    htmlConsole.clear();

    setTimeout(function () {
    $('#clear-console').removeClass('icon-budicon-495');
    $('#clear-console').addClass('icon-budicon-498');
    }, 250);
});

$('#config-update').click(setConfig);

$('#clear-org').click(function (e) {
    e.preventDefault();

    Cookies.remove('auth0_config_organization');
    $('#config-organization').val('');
    organization = null;
    setConfig();
});

$('#invoke-invite').click(function (e) {
    e.preventDefault();

    var inviteUrl = prompt('Paste in the user invitation URL:');

    if (inviteUrl) {
    var url = new URL(inviteUrl);
    var params = new URLSearchParams(url.search);

    webAuth.authorize({
        organization: params.get('organization'),
        invitation: params.get('invitation')
    });
    }
});

$('.login-db').click(function (e) {
    e.preventDefault();
    webAuth.login(
    {
        username: $('.login-username').val(),
        password: $('.login-password').val()
    },
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

$('.passwordless-login-verify').click(function (e) {
    e.preventDefault();
    webAuthPasswordless.passwordlessLogin(
    {
        connection: 'email',
        email: $('.passwordless-login-username').val(),
        verificationCode: $('.passwordless-login-code').val()
    },
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

$('.passwordless-login-db').click(function (e) {
    e.preventDefault();
    webAuthPasswordless.passwordlessStart(
    {
        connection: 'email',
        email: $('.passwordless-login-username').val(),
        send: 'code'
    },
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

var popupHandler;

$('.popup-login-db-preload').click(function (e) {
    e.preventDefault();
    popupHandler = webAuth.popup.preload();
});

$('.popup-login-db').click(function (e) {
    e.preventDefault();

    webAuth.popup.loginWithCredentials(
    {
        connection: $('#popup-login-connection').val(),
        username: $('.popup-login-username').val(),
        password: $('.popup-login-password').val()
    },
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

$('.client-login-db').click(function (e) {
    e.preventDefault();
    webAuth.client.login(
    {
        realm: $('#client-login-realm').val(),
        username: $('.client-login-username').val(),
        password: $('.client-login-password').val()
    },
    function (err, data) {
        htmlConsole.dumpCallback.bind(htmlConsole)(err, data);
        this.webAuth.client.userInfo(
        data.accessToken,
        htmlConsole.dumpCallback.bind(htmlConsole)
        );
    }
    );
});

$('.login-facebook').click(function (e) {
    e.preventDefault();

    var config = { connection: 'facebook' };

    if (organization) {
    config.organization = organization;
    }

    webAuth.authorize(config);
});

$('.login-hosted').click(function (e) {
    e.preventDefault();

    var config = {};

    if (organization) {
    config.organization = organization;
    }

    webAuth.authorize(config);
});

$('.login-twitter').click(function (e) {
    e.preventDefault();

    var config = { connection: 'twitter' };

    if (organization) {
    config.organization = organization;
    }

    webAuth.authorize(config);
});

$('.login-github').click(function (e) {
    e.preventDefault();

    var config = { connection: 'github' };

    if (organization) {
    config.organization = organization;
    }

    webAuth.authorize(config);
});

$('.popup-login-facebook').click(function (e) {
    e.preventDefault();

    var options = {
    redirectURI: REDIRECT_URL + '/callback_popup.html',
    connection: 'facebook'
    };

    if (organization) {
    options.organization = organization;
    }

    webAuth.popup.authorize(
    options,
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

$('.popup-login-hosted').click(function (e) {
    e.preventDefault();

    var options = {
    redirectURI: REDIRECT_URL + '/callback_popup.html'
    };

    if (organization) {
    options.organization = organization;
    }

    webAuth.popup.authorize(
    options,
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

$('.popup-login-twitter').click(function (e) {
    e.preventDefault();

    var options = {
    connection: 'twitter',
    redirectURI: REDIRECT_URL + '/callback_popup.html'
    };

    if (organization) {
    options.organization = organization;
    }

    webAuth.popup.authorize(
    options,
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

$('.popup-login-github').click(function (e) {
    e.preventDefault();

    var options = {
    connection: 'github',
    redirectURI: REDIRECT_URL + '/callback_popup.html'
    };

    if (organization) {
    options.organization = organization;
    }

    webAuth.popup.authorize(
    options,
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

$('.logout').click(function (e) {
    e.preventDefault();
    webAuth.logout({ returnTo: REDIRECT_URL });
});

$('.renew-auth').click(function (e) {
    e.preventDefault();
    webAuth.renewAuth(
    {
        usePostMessage: true,
        redirectURI: REDIRECT_URL + '/callback.html'
    },
    htmlConsole.dumpCallback.bind(htmlConsole)
    );
});

$('.token-endpoint').click(function (e) {
    e.preventDefault();

    var params = new URLSearchParams(window.location.search);

    if (params.get('code')) {
    webAuth.client.oauthToken(
        {
        code: params.get('code'),
        grantType: 'authorization_code',
        redirectUri: window.location.origin
        },
        function (err, data) {
        history.pushState({}, null, '/');
        htmlConsole.dumpCallback(err, data);
        }
    );
    }
});

$('.web-message-check-session').click(function (e) {
    e.preventDefault();
    webAuth.checkSession({}, htmlConsole.dumpCallback.bind(htmlConsole));
});

$('.getssodata').click(function (e) {
    e.preventDefault();
    webAuth.client.getSSOData(htmlConsole.dumpCallback.bind(htmlConsole));
});

$(document.body).append($('<div class="loaded">LOADED</div>'));
