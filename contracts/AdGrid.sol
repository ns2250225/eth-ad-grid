pragma solidity ^0.4.4;

contract AdGrid {

    // 设置领取奖励的冷却时间
    uint cooldownTime = 1 minutes;

    // 每天可以领取的ETH
    uint256 public dailyPrize = 0.01 ether;

    // 每次发布广告的价格
    uint256 public publishPrice = 0.1 ether;

    // 合约拥有者的地址
    address owner;

    // 发布广告事件
    event PublishAd(address sender);

    // 每天领取ETH事件
    event DailyGetETH(address sender);

    // 存放address到冷却时间的映射
    mapping (address => uint) readyTime;

    // 存放用户账户的余额
    mapping (address => uint) public balances;

    // 函数装饰器--合约拥有者权限
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    // 合约构造函数
    function AdGrid() {
        owner = msg.sender;
    }

    // 触发冷却函数
    function _triggerCooldown(address _people) internal {
        readyTime[_people] = (now + cooldownTime);
    }

    // 检查是否冷却中
    function isReady(address _people) public view returns (bool) {
        return (readyTime[_people] <= now);
    }

    // 发布广告函数
    function Publish() payable {
        require(msg.value >= publishPrice);

        // 触发发布广告事件
        PublishAd(msg.sender);
    }

    // 每天获取奖励函数
    function GetDailyETH() payable {

        // 每天领取一次奖励
        msg.sender.transfer(dailyPrize);

        // 触发冷却一天的机制
        _triggerCooldown(msg.sender);

        // 触发领取奖励事件
        DailyGetETH(msg.sender);
    }


    // 查看合约余额
    function contractBalance() constant returns(uint) {
        return this.balance;
    }


    // 设置发布广告价格
    function setPublishPrice(uint _publishPrice) onlyOwner {
        publishPrice = _publishPrice;
    }

    // 设置每天奖励
    function setdailyPrize(uint _dailyPrize) onlyOwner {
        dailyPrize = _dailyPrize;
    }

}
