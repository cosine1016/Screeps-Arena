import * as utils from 'game/utils';
import * as prototypes from 'game/prototypes';
import * as constants from 'game/constants';
import * as arena from 'arena';
import { searchPath } from 'game/path-finder';

// グローバルオブジェクト
var myCreeps;       // 自分のクリープ
var myTower;        // 自分のタワー
var myFlag;         // 自分のフラッグ
var enemyCreeps;    // 敵クリープ
var enemyTower;     // 敵タワー
var enemyFlag;      // 敵フラグ
var attacks;        // アタッカー
var rangeAttacks;   // 遠隔アタッカー
var heals;          // ヒーラー
var flagHeals;      // 拠点ヒーラー

/**
 * メインループ
 * @returns 
 */
export function loop() {
    // オブジェクト更新
    myCreeps    = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);
    myTower  = utils.getObjectsByPrototype(prototypes.StructureTower).filter(tower => tower.my)
    enemyCreeps = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => !creep.my);
    enemyTower  = utils.getObjectsByPrototype(prototypes.StructureTower).filter(tower => !tower.my)
    enemyFlag  = utils.getObjectsByPrototype(prototypes.Flag).find(flag => !flag.my)
    myFlag  = utils.getObjectsByPrototype(prototypes.Flag).find(flag => flag.my)

    // タワー行動
    myTower.forEach(towerLoop);

    // 敵クリープ殲滅済みならフラッグに直行
    if(!enemyCreeps.length){
        myCreeps.forEach(creep => creep.moveTo(enemyFlag));
        return;
    }   

    // クリープフィルタリング
    var work = myCreeps;
    // アタッカーパーツがあればアタッカー判定
    attacks          = work.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.ATTACK ));
    work = work.filter(i => attacks.indexOf(i) == -1);
    // レンジアタッカーパーツがあれば遠隔
    rangeAttacks    = work.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.RANGED_ATTACK ));
    work = work.filter(i =>rangeAttacks.indexOf(i) == -1);

    // ヒールパーツがあればヒラ
    heals       = work.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.HEAL )).sort(function(first, secound){
        return getLineLengthSquare(myFlag, first) - getLineLengthSquare(myFlag, secound);
    });
    // フラッグに近いヒラは拠点防衛
    flagHeals = [heals[0]];
    heals = heals.filter(i => flagHeals.indexOf(i) == -1);
    // 移動パーツのみなら専用動作
    work = work.filter(i => heals.indexOf(i) == -1);

    
    // ループ実行
    attacks.forEach(attackLoop);
    rangeAttacks.forEach(rangeAttackLoop);
    flagHeals.forEach(flagHealLoop);
    heals.forEach(healLoop);
    work.forEach(nonLoop)
}

/**
 * 近接アタッカー
 * 拠点防衛
 * @param {]} creep 
 */
function attackLoop(creep){   
    var target = enemyCreeps.concat(enemyTower, enemyFlag);
    var targetSort = target.sort(function(first, secound){
        return getLineLengthSquare(creep, first) - getLineLengthSquare(creep, secound);
    })
    // 敵までの距離
    var range = 5;
    // フラッグまでの距離
    var gurdLine = 3;
    // 敵が近づいたら近づいて攻撃
    if(getLineLengthSquare(creep, targetSort[0]) < range * range){
        if(creep.attack(targetSort[0]) == constants.ERR_NOT_IN_RANGE) {
            creep.moveTo(targetSort[0]);
        }
    }else if (getLineLengthSquare(creep, myFlag) > gurdLine * gurdLine){
        // 敵が居なければフラッグに寄っておく
        creep.moveTo(myFlag);
    }
}
/**
 * 遠隔アタッカー
 * 攻撃要員
 * @param {*} creep 
 */
function rangeAttackLoop(creep){
    var target = enemyCreeps.concat(enemyTower, enemyFlag);
    var targetSort = target.sort(function(first, secound){
        return getLineLengthSquare(creep, first) - getLineLengthSquare(creep, secound);
    })
    // 一番近い敵を殴る
    if(creep.rangedAttack(targetSort[0]) == constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(targetSort[0]);
    }
}

/**
 * ヒーラー
 * 遠隔アタッカーの回復要員
 * @param {*} creep 
 */
function healLoop(creep){
    var damagedCreep    = myCreeps.filter(creep => creep.hits != creep.hitsMax).sort(function(first, secound){
        return getLineLengthSquare(creep, first) - getLineLengthSquare(creep, secound);
    });
    var rangedAttackSort = rangeAttacks.sort(function(first, secound){
        return getLineLengthSquare(creep, first) - getLineLengthSquare(creep, secound);
    });
    
    // ダメージを受けている味方が居るならそちらに向かう
    if(damagedCreep.length){
        if(creep.heal(damagedCreep[0]) == constants.ERR_NOT_IN_RANGE) {
            creep.moveTo(damagedCreep[0]);
        }
    } else{
        //そうでない場合は近くのレンジに近づく
        creep.moveTo(rangedAttackSort[0]);
    }
}

/**
 * 拠点防衛ヒラ
 * 近接の拠点防衛クリープをヒールする
 * @param {*} creep 
 */
function flagHealLoop(creep){
    var targetAttaks    = attacks.sort(function(first, secound){
        return first.hits - secound.hits;
    });
    
    // とりあえず近接をヒール
    if(creep.heal(targetAttaks[0]) == constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(targetAttaks[0]);
    }
}

/**
 * 移動のみクリープ
 * パーツ回収しにいく
 * @param {*} creep 
 */
function nonLoop(creep){
    var parts = utils.getObjectsByPrototype(constants.bodyPart).sort(function(first, secound){
        return getLineLengthSquare(creep, first) - getLineLengthSquare(creep, secound);
    });
    if(parts.length){
        creep.moveTo(parts[0]);
    }
}

/**
 * タワー
 * @param {*} tower 
 */
function towerLoop(tower){
    // とりあえず近い敵を攻撃
    enemyCreeps.forEach(enemy => tower.attack(enemy));
}

/**
 * オブジェクト間の距離の二乗を返却
 * @param {*} object1 
 * @param {*} object2 
 * @returns 
 */
function getLineLengthSquare(object1, object2){
    var x = (object1.x - object2.x);
    var y = (object1.y - object2.y);
    return x*x + y*y;
}
