import * as utils from 'game/utils';
import * as prototypes from 'game/prototypes';
import * as constants from 'game/constants';
import * as arena from 'arena';
import { searchPath } from 'game/path-finder';

var myCreeps;
var myTower;
var myFlag;
var enemyCreeps;
var enemyTower;
var enemyFlag;
var attacks;
var rangeAttacks;
var heals;
export function loop() {
    myCreeps    = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);
    myTower  = utils.getObjectsByPrototype(prototypes.StructureTower).filter(tower => tower.my)
    enemyCreeps = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => !creep.my);
    enemyTower  = utils.getObjectsByPrototype(prototypes.StructureTower).filter(tower => !tower.my)
    enemyFlag  = utils.getObjectsByPrototype(prototypes.Flag).filter(flag => !flag.my)
    myFlag  = utils.getObjectsByPrototype(prototypes.Flag).filter(flag => flag.my)

    myTower.forEach(towerLoop);

    if(!enemyCreeps.length){
        myCreeps.forEach(creep => creep.moveTo(enemyFlag[0]));
        return;
    }   

    attacks          = myCreeps.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.ATTACK ));
    rangeAttacks    = myCreeps.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.RANGED_ATTACK ));
    heals           = myCreeps.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.HEAL ));

    attacks.forEach(attackLoop);
    rangeAttacks.forEach(rangeAttackLoop);
    heals.forEach(healLoop);
}

function attackLoop(creep){   
    var target = enemyCreeps.concat(enemyTower, enemyFlag);
    var targetSort = target.sort(function(first, secound){
        return getLineLengthSquare(creep, first) - getLineLengthSquare(creep, secound);
    })
    if(creep.attack(targetSort[0]) == constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(myFlag[0]);
    }
}
function rangeAttackLoop(creep){
    var target = enemyCreeps.concat(enemyTower, enemyFlag);
    var targetSort = target.sort(function(first, secound){
        return getLineLengthSquare(creep, first) - getLineLengthSquare(creep, secound);
    })
    if(creep.rangedAttack(targetSort[0]) == constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(targetSort[0]);
    }
}
function healLoop(creep){
    var damagedCreep    = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my && creep.hits != creep.hitsMax);
    
    if(damagedCreep.length){
        if(creep.heal(damagedCreep[0]) == constants.ERR_NOT_IN_RANGE) {
            creep.moveTo(damagedCreep[0]);
        }
    } else{
        creep.moveTo(rangeAttacks[0]);
    }
}
function towerLoop(tower){
    enemyCreeps.forEach(enemy => tower.attack(enemy));
}

function getLineLengthSquare(object1, object2){
    var x = (object1.x - object2.x);
    var y = (object1.y - object2.y);
    return x*x + y*y;
}
