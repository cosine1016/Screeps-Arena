import * as utils from 'game/utils';
import * as prototypes from 'game/prototypes';
import * as constants from 'game/constants';
import * as arena from 'arena';

export function loop() {
    var myCreep = utils.getObjectsByPrototype(prototypes.Creep).find(creep => creep.my);
    var enemyCreep = utils.getObjectsByPrototype(prototypes.Creep).find(creep => !creep.my);
    if(myCreep.attack(enemyCreep) == constants.ERR_NOT_IN_RANGE) {
        myCreep.moveTo(enemyCreep);
    }
}
