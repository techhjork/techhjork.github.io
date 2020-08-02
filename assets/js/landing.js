var appKey = "uLZFp95brXYPbJP6q-zj:o7o_MJ-CEntrKx_tH2-A";
var appType = "TravelAgent";

var timerId;

var validateRules = {
  name: {
    required: true
  },
  company: {
    required: true
  },
  email: {
    required: true,
    email: true
  },
  phone: {
    required: true,
    digits: true
  },
  password: {
    required: true
  },
  otp: {
    required: true
  }
};

var validateMsg = {
  name: {
    required: "Please provide your name"
  },
  company: {
    required: "Please provide your company name"
  },
  email: {
    required: "Please provide your email address",
    email: "Please enter a valid email address"
  },
  phone: {
    required: "Please provide your phone number",
    digits: "Please enter valid phone number"
  },
  password: {
    required: "Please enter password"
  },
  otp: {
    required: "Please enter OTP"
  }
};

function checkIfLoggedIn() {
  var isLoggedIn = localStorage.getItem("superAgentLogin");
  if (isLoggedIn) {
    window.location.href = "/superAgent/home";
  }
}

function apiRequest(reqObj) {
  // url, method, payload, access_token
  var key = "params";
  var myData = reqObj["payload"];
  if (reqObj["method"] !== "GET") {
    key = "data";
    myData = JSON.stringify(reqObj["payload"]);
  }

  var headers = {
    "content-type": "application/json",
    "cache-control": "no-cache",
    country_code: "IN",
    language_code: "EN",
    access_token: btoa(reqObj["access_token"])
  };

  return $.ajax({
    url: reqObj["url"],
    type: reqObj["method"],
    dataType: "json",
    headers: headers,
    [key]: myData
  });
}

function apiLoader(id, isLoading) {
  if (isLoading) {
    $(id)
      .find(".btn_loader")
      .show();
    $(id)
      .find(".loader_box")
      .prop("disabled", true);
    $(id)
      .find(".error_component")
      .slideUp();
  } else {
    $(id)
      .find(".btn_loader")
      .hide();
    $(id)
      .find(".loader_box")
      .prop("disabled", false);
  }
}

function apiError(modal, errorMgs) {
  $(modal)
    .find(".error_component")
    .slideDown();
  $(modal)
    .find(".error_component .error_box_text")
    .text(errorMgs);
}

function getErrorMsg(error) {
  return (
    (error && error["responseJSON"] && error["responseJSON"]["message"]) ||
    "Some error occured. Please try again later"
  );
}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function loginUser(response) {
  var devise_role = response["devise_role"];

  var loggedInUserDetails = {
    success: true,
    user_profile: response
  };

  localStorage.setItem("ta", true);
  localStorage.setItem("deviseRole", devise_role);
  if (response && response.accountType) {

    var maxAllowedUpSellPercentage = response.maxAllowedUpSellPercentage;
    var encodeUpsell = btoa('TA:UPSELL:KFPNXW:' + maxAllowedUpSellPercentage);

    localStorage.setItem("accountData", JSON.stringify(response.accountType));
    localStorage.setItem(
      "maxAllowedUpSellPercentage",
      JSON.stringify(response.maxAllowedUpSellPercentage)
    );
    localStorage.setItem('WZRK_KFPNXW', encodeUpsell);

    /* Generate random local storage */
    localStorage.setItem('WZRK_HIUAJQ', makeid(20));
    localStorage.setItem('WZRK_TBVJXH', makeid(20));
    localStorage.setItem('WZRK_BNIDYL', makeid(20));
    localStorage.setItem('WZRK_JBRZIK', makeid(20));
  }
  localStorage.setItem("superAgentLogin", true);
  window.location.href = "/superAgent/home";
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function modelContent() {
  $("#mobileModal").modal("show");
}

/* Sign in form with password */
$("#sign_in_form").validate({
  rules: {
    phone: validateRules["phone"],
    password: validateRules["password"]
  },
  messages: {
    phone: validateMsg["phone"],
    password: validateMsg["password"]
  },
  submitHandler: function (form) {
    event.preventDefault();
    signIn(form);
  }
});

function signIn(formObj) {
  var modal = "#myModal";
  apiLoader(modal, true);
  var phone = $(formObj)
    .find("input[name=phone]")
    .val();
  var password = $(formObj)
    .find("input[name=password]")
    .val();
  apiRequest({
    url: "/api/sa/userSignIn",
    payload: {
      phone: document.getElementById("countryCodeSignIn").value + ":" + phone,
      password: password,
      phone_code: document.getElementById("countryCodeSignIn").value
    },
    method: "POST",
    access_token: appKey
  })
    .then(function (response) {
      apiLoader(modal, false);
      loginUser(response);
    })
    .catch(function (error) {
      apiLoader(modal, false);
      var errMsg = getErrorMsg(error);
      apiError(modal, errMsg);
    });
}

function openMobileModal() {
  $("#myModal").modal("hide");
  $("#mobileModal").modal("show");
}

/* Sign in with otp */
$("#generate_otp_modal").validate({
  rules: {
    phone: validateRules["phone"]
  },
  messages: {
    phone: validateMsg["phone"]
  },
  submitHandler: function (form) {
    event.preventDefault();
    var phone = $(form)
      .find("input[name=phone]")
      .val();
    generateOTP(phone, "#mobileModal", "#verifyOtpModal");
  }
});

/* Forgot password otp */
$("#forgot-password").validate({
  rules: {
    phone: validateRules["phone"]
  },
  messages: {
    phone: validateMsg["phone"]
  },
  submitHandler: function (form) {
    event.preventDefault();
    var phone = $(form)
      .find("input[name=phone]")
      .val();
    generateOTP(phone, "#forgotPasswordModal", "#forgotPasswordOtpModal");
  }
});

/* Generate OTP API */
function generateOTP(phone, modal, nextModal) {
  apiLoader(modal, true);

  apiRequest({
    url: "/api/sa/users/generate_otp",
    payload: {
      phone: phone,
      country_code: document.getElementById("countryCodeSendOtp").value
    },
    method: "POST",
    access_token: appKey
  })
    .then(function (response) {
      apiLoader(modal, false);
      if (timerId) {
        clearTimeout(timerId);
        showResendButton();
      }
      $(modal).modal("hide");
      $(nextModal).modal("show");
      $(nextModal)
        .find("input[name=phone]")
        .val(phone);
    })
    .catch(function (error) {
      var errMsg = getErrorMsg(error);
      apiLoader(modal, false);
      apiError(modal, errMsg);
    });
}

/* Sign with OTp entered */
$("#verify-otp-modal").validate({
  rules: {
    phone: validateRules["phone"],
    otp: validateRules["otp"]
  },
  messages: {
    phone: validateMsg["phone"],
    otp: validateMsg["otp"]
  },
  submitHandler: function (form) {
    event.preventDefault();
    forgotPasswordOtpForm(form, "#verifyOtpModal");
  }
});

/* forgot otp password form */
$("#forgot-otp-password").validate({
  rules: {
    phone: validateRules["phone"],
    otp: validateRules["otp"]
  },
  messages: {
    phone: validateMsg["phone"],
    otp: validateMsg["otp"]
  },
  submitHandler: function (form) {
    event.preventDefault();
    forgotPasswordOtpForm(form, "#forgotPasswordOtpModal");
  }
});

/* Sign API integrate */
function forgotPasswordOtpForm(formObj, modal) {
  apiLoader(modal, true);
  var phone = $(formObj)
    .find("input[name=phone]")
    .val();
  var otp = $(formObj)
    .find("input[name=otp]")
    .val();
  apiRequest({
    url: "/api/sa/userSignIn",
    payload: {
      phone: document.getElementById("countryCodeSendOtp").value + ":" + phone,
      otp: otp,
      phone_code: document.getElementById("countryCodeSendOtp").value
    },
    method: "POST",
    access_token: appKey
  })
    .then(function (response) {
      apiLoader(modal, false);
      loginUser(response);
    })
    .catch(function (error) {
      apiLoader(modal, false);
      var errMsg = getErrorMsg(error);
      apiError(modal, errMsg);
    });
}

function signInWithPassword() {
  $("#mobileModal").modal("hide");
  $("#myModal").modal("show");
}

function signInWithPasswordVerifyOTP() {
  $("#verifyOtpModal").modal("hide");
  $("#myModal").modal("show");
}

function openFormSlider() {
  $(".form_slider").addClass("shown");
}

function closeFormSlider() {
  $(".form_slider").removeClass("shown");
}

/* Validate lead form */
$("#desktop-lead-form").validate({
  rules: {
    name: validateRules["name"],
    company: validateRules["company"],
    email: validateRules["email"],
    phone: validateRules["phone"]
  },
  messages: {
    name: validateMsg["name"],
    company: validateMsg["company"],
    email: validateMsg["email"],
    phone: validateMsg["phone"]
  },
  submitHandler: function (form) {
    event.preventDefault();
    submitLeadForm(form);
  }
});

$("#mobile-lead-form").validate({
  rules: {
    name: validateRules["name"],
    company: validateRules["company"],
    email: validateRules["email"],
    phone: validateRules["phone"]
  },
  messages: {
    name: validateMsg["name"],
    company: validateMsg["company"],
    email: validateMsg["email"],
    phone: validateMsg["phone"]
  },
  submitHandler: function (form) {
    event.preventDefault();
    submitLeadForm(form);
  }
});

function submitLeadForm(formObj) {
  var form = $(formObj);

  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  var selected_country = document.getElementById("country").value
  var assignee_data = assigneeData(selected_country);

  var payload = {
    "Created By": assignee_data['assigneeTo'],
    "Created By Name": assignee_data['assigneeName'],
    AssignedTo: assignee_data['assigneeTo'],
    AssigneeName: assignee_data['assigneeName'],
    SourceName: "Central_Inbound",
    Type: "account",
    SubType: "Travel Agent",
    "Assignment Details.Closure date.day": day,
    "Assignment Details.Closure date.month": month,
    "Assignment Details.Closure date.year": year,
    "Admin Details.Name": form.find("input[name=name]").val(),
    "Admin Details.Email": form.find("input[name=email]").val(),
    "Admin Details.Contact Number": form.find("input[name=phone]").val(),
    "Lead Details.Name": form.find("input[name=company]").val(),
    UtmSource: "",
    utm_medium: "",
    Country: selected_country
  };
  leadApiRequest(payload);
}

function assigneeData (country) {
  var assigneeName, assigneeTo;
  switch (country) {
    case "Indonesia":
      assigneeName = 'Andhika Pramanta (andhikapramanta.in@oyorooms.com)';
      assigneeTo = 41979450;
      break;
    case "Malaysia":
      assigneeName = 'Mohamad Faisal Sabri (mohamadfaisalsabri.my@oyorooms.com)';
      assigneeTo = 37363836;
      break;
    case "UAE":
      assigneeName = 'Upender Seth (upender.seth@oyorooms.com)';
      assigneeTo = 50247202;
      break;
    case "Thailand":
      assigneeName = 'Kshitij Shandilya (kshitij.shandilya@oyorooms.com)';
      assigneeTo = 24318517;
      break;
    case "Philippines":
      assigneeName = 'Juanvera Ph (juanvera.ph@oyorooms.com)';
      assigneeTo = 67974150;
      break;
    case "Vietnam":
      assigneeName = 'Sagar Jain (sagar.jain2@oyorooms.com)';
      assigneeTo = 39459294;
      break;
    case "Saudi Arabia":
      assigneeName = 'Anoop Kumar (Anoop.kumar1@oyorooms.com)';
      assigneeTo = 60807530;
      break;
    default:
      assigneeName = 'Central Corporate (central.corporate@oyorooms.com)';
      assigneeTo = 18552623;
  }
  return {
    assigneeName: assigneeName,
    assigneeTo: assigneeTo
  }; 
}

function leadApiRequest(payload) {
  apiLoader(".lead_form", true);

  $.ajax({
    url: "/api/sa/lc/create",
    type: "POST",
    dataType: "json",
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache"
    },
    data: JSON.stringify(payload)
  })
    .done(function (response) {
      var errMsg =
        response && response["errorsSize"] > 0
          ? response["errors"][0]
          : undefined;
      if (errMsg) {
        apiError(".lead_form", errMsg);
      } else {
        $(".lead_shown_form").addClass("hideElem");
        $(".mobile_lead_shown_form").addClass("hidden");
        $(".lead_sucess_msg").removeClass("hidden");
      }
    })
    .fail(function (error) {
      var errMsg = getErrorMsg(error);
      apiError(".lead_form", errMsg);
    })
    .always(function () {
      apiLoader(".lead_form", false);
    });
}

function forgotPasswordForm(formObj) {
  var phone = $(formObj)
    .find("input[name=phone]")
    .val();
  if (timerId) {
    clearTimeout(timerId);
    showResendButton();
  }
  $("#forgotPasswordModal").modal("hide");
  $("#forgotPasswordOtpModal").modal("show");
  $("#forgotPasswordOtpModal input[name=phone]").val(phone);
}

function openForgotPassword() {
  $("#myModal").modal("hide");
  $("#forgotPasswordOtpModal").modal("hide");
  $("#forgotPasswordModal").modal("show");
}

/* Edit phone number */
function editPhoneNumber(type) {
  if (type === "login") {
    $("#verifyOtpModal").modal("hide");
    openMobileModal();
  } else {
    openForgotPassword();
  }
}

/* Resend OTP */
function resendOtp(modal) {
  var phone = $(modal)
    .find("input[name=phone]")
    .val();

  $(modal)
    .find(".resend_otp")
    .addClass("hidden");
  $(modal)
    .find(".otp_loader")
    .removeClass("hidden");

  apiRequest({
    url: "/api/sa/users/generate_otp",
    payload: {
      phone: phone,
      country_code: document.getElementById("countryCodeSendOtp").value
    },
    method: "POST",
    access_token: appKey
  })
    .then(function (response) {
      $(modal)
        .find(".otp_loader")
        .addClass("hidden");
      $(".otp_timer").removeClass("hidden");
      countdown(modal);
    })
    .catch(function (error) {
      $(modal)
        .find(".resend_otp")
        .removeClass("hidden");
      $(modal)
        .find(".otp_loader")
        .hide();
      var errMsg = getErrorMsg(error);
      apiError(modal, errMsg);
    });
}

function countdown(modal) {
  var timeLeft = 60;
  timerId = setInterval(function () {
    if (timeLeft < 0) {
      clearTimeout(timerId);
      $(modal)
        .find(".otp_timer")
        .html("You can request new OTP in 00:60");
      showResendButton();
    } else {
      var timeText = timeLeft;
      if (timeLeft < 10) {
        timeText = "0" + timeLeft;
      }
      $(modal)
        .find(".otp_timer")
        .html("You can request new OTP in 00:" + timeText);
      timeLeft--;
    }
  }, 1000);
}

function showResendButton() {
  $(".otp_timer").addClass("hidden");
  $(".resend_otp").removeClass("hidden");
}

/* Show Password */
$(".showPassword").on("click", function () {
  var inputField = $(this)
    .parent()
    .find("input");
  var fieldType = inputField.prop("type");
  if (fieldType === "password") {
    inputField.prop("type", "text");
  } else {
    inputField.prop("type", "password");
  }
});

$("#happyCustomer").carousel({
  interval: 500000
});

if (document.body.clientWidth > 767) {
  $(".carousel .carousel-item").each(function () {
    var next = $(this).next();
    if (!next.length) {
      next = $(this).siblings(":first");
    }
    next
      .children(":first-child")
      .clone()
      .appendTo($(this));
    if (next.next().length > 0) {
      next
        .next()
        .children(":first-child")
        .clone()
        .appendTo($(this))
        .addClass("rightest");
    } else {
      $(this)
        .siblings(":first")
        .children(":first-child")
        .clone()
        .appendTo($(this));
    }
  });
}
