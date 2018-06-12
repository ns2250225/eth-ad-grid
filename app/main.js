var web3Provider = null
var contracts = {}
var balance = 0
var account = null
var instance = null

var backendURL = "http://127.0.0.1:9999/ad/ad/"

$(function() {
  $(window).load(function() {
    init()
  })
})

//初始化fileinput控件（第一次初始化）
function initFileInput(ctrlName, uploadUrl) {    
    var control = $('#' + ctrlName)
    control.fileinput({
        language: 'zh',                               //设置语言
        uploadUrl: uploadUrl,                         //上传的地址
        allowedFileExtensions : ['jpg', 'png','gif'], //接收的文件后缀
        showUpload: true,                             //是否显示上传按钮
        showCaption: false,                           //是否显示标题
        browseClass: "btn btn-primary",               //按钮样式             
        previewFileIcon: "<i class='glyphicon glyphicon-king'></i>", 
    })
}

// 获取广告列表
function getAdList() {
  $.get(backendURL, function(result){
    console.log(result)

    $("#ad_nums").html(result.length)

    $("#ad_list").children().remove()

    for (item of result) {
      var tmp = $(`<div class="col-md-3">
          <div class="panel panel-default">
          <div class="panel-body">
            <img class="ad_img" src="${item.ad_file}">
          </div>
        </div>
        </div>`)

      $("#ad_list").append(tmp)
    }
  })
}


// 初始化
function init() {
  console.log("init start...")
  
  // 获取广告列表
  getAdList()

  // 初始化上传控件
  initFileInput("ad-upload", backendURL)

   //异步上传返回错误处理
  $('#ad-upload').on('fileerror', function(event, data, msg) {
      console.log("fileerror")
      console.log(data)
  })

  //异步上传返回成功处理
  $("#ad-upload").on("fileuploaded", function(event, data, previewId, index) {
      console.log("fileuploaded")
      console.log(data.response.ad_file)

      getAdList()

      $('#publishModal').modal('hide')
  })

  // init web3
  if (typeof web3 !== 'undefined') {
      web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
  } else {
      // set the provider you want from Web3.providers
      web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
      web3 = new Web3(web3Provider)
      alert('You need MetaMask extension or Parity to use this app.')
  }

  // init contracts
  $.getJSON('AdGrid.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var BlogSystemArtifact = data

      try {
         contracts.AdGrid = TruffleContract(BlogSystemArtifact)

        // Set the provider for our contract.
        contracts.AdGrid.setProvider(web3Provider)

        checkAccount()

      } catch(err) {
          console.log(err)
      }
  })

  // event binding
  $(document).on('click', '#publish', publish)
  $(document).on('click', '#get_eth', get_eth)

  console.log("init end...")
}


function checkAccount() {
  web3.eth.getAccounts(function(error, accounts) {
        account = accounts[0]

        contracts.AdGrid.deployed().then(function(_instance) {
            instance = _instance

            checkReady()
            checkBalance()

        })
        .catch(function(err) {
            alert('Make sure you are connected to Ropsten network')
        })
    })
}


function checkBalance() {
  instance.contractBalance.call().then(function(_balance) {
        balance = _balance.valueOf()
        var balanceInEther = web3.fromWei(balance, "ether")
        $("#balance").html(balanceInEther + " ether")
  })
}

function checkReady() {
  instance.isReady.call(account).then(function(_isReady) {
      console.log("============>", _isReady)
      if (_isReady) {
        $("#get_eth").attr("disabled", false)
      } else {
        $("#get_eth").attr("disabled", true)
      }
  })
}

function get_eth() {
  checkBalance()

  if(balance != 0) {
    instance.GetDailyETH.sendTransaction({from: account, value: 0, gas: 3141592}).then(function(resp) {
        console.log(resp)
        alert("领取成功！")
        checkReady()
        setTimeout(checkBalance, 2000)
    })
    .catch(function(err) {
        console.log(err)
    });
  } else {
    alert('没有足够的赞助费能领取~')
  }
}


function publish() {

  instance.Publish.sendTransaction({from: account, value: web3.toWei('0.1', 'ether')}).then(function(resp) {
    console.log(resp)
    $('#publishModal').modal('show')
    setTimeout(checkBalance, 1000)
  })
  .catch(function(err) {
    console.log(err)
  })
}