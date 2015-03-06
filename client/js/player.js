define(['character', 'exceptions'], function(Character, Exceptions) {

    var Player = Character.extend({
        MAX_LEVEL: 10,

        init: function(id, name, pw, kind) {
            this._super(id, kind);

            this.name = name;
            this.pw = pw;
            

            // Renderer
             this.nameOffsetY = -10;
             this.admin = null;
             this.mod = null;
            // sprites
            this.spriteName = "clotharmor";
            this.armorName = "clotharmor";
            this.weaponName = "sword1";
 
             // Inventory
            this.inventory = [];
            this.inventoryCount = [];
            this.healingCoolTimeCallback = null;

            this.magicCoolTimeCallback = null;
            this.healTargetName = null;
        
            
            // modes
            this.isLootMoving = false;
            this.isSwitchingWeapon = true;

            // PVP Flag
            this.pvpFlag = false;
        },

        
        loot: function(item) {
            if(item) {
                var rank, currentRank, msg;
            
                if(item.type === "weapon") {
                    rank = Types.getWeaponRank(item.kind);
                    currentRank = Types.getWeaponRank(Types.getKindFromString(this.weaponName));
                    msg = "You are wielding a better weapon";
                    var rankRequirement = (rank * 5) + rank;
                    if(rank && currentRank) {
                        if(rank === currentRank) {
                            throw new Exceptions.LootException("You already have this "+item.type);
                        } else if (this.level < rankRequirement) {
                            throw new Exceptions.LootException("You need to be level " + rankRequirement + " to wield this.");
                        } else if(rank <= currentRank) {
                            throw new Exceptions.LootException(msg);
                        }
                    }
                } else if(item.type === "armor"){
                   
                    if(this.level > 45){
                      this.putInventory(item.kind, 1);
                    } else {
                      rank = Types.getArmorRank(item.kind);
                      currentRank = Types.getArmorRank(Types.getKindFromString(this.armorName));
                      msg = "You are wielding a better armor";
                      var rankRequirement = (rank * 5) + rank ;
                      if(rank && currentRank) {
                        if(rank === currentRank) {
                            //this.putInventory(item.kind, 1);
                            throw new Exceptions.LootException("You already have this " + item.type);
                            
                        } else if (this.level < rankRequirement) {
                            throw new Exceptions.LootException("You need to be level " + rankRequirement + " to wield this.");
                        } else if(rank <= currentRank) {
                           
                            throw new Exceptions.LootException(msg);
                        }
                      }
                    }
                } else if(item.kind === Types.Entities.CAKE){
                    this.putInventory(item.kind, 1);
                } else if(Types.isHealingItem(item.kind)){
                    this.putInventory(item.kind, item.count);
                } else if(item.kind === Types.Entities.CD) {
                    this.putInventory(item.kind, 1);
                }
            
                log.info('Player '+this.id+' has looted '+item.id);
                if(Types.isArmor(item.kind) && this.invincible) {
                    this.stopInvincibility();
                }
                item.onLoot(this);
            }
        },
        putInventory: function(itemKind, count){
            if(Types.isHealingItem(itemKind)){
                
                if(this.inventory[0] === itemKind){
                    if (this.inventoryCount[0] < 25) {
                        this.inventoryCount[0] += count;
                    } else {
                        throw new Exceptions.LootException("You cannot hold any more items in your inventory.");
                    }
                } else if(this.inventory[1] === itemKind){
                    if (this.inventoryCount[1] < 25) {
                        this.inventoryCount[1] += count;
                    } else {
                        throw new Exceptions.LootException("You cannot hold any more items in your inventory.");
                    }
                } else{
                    this._putInventory(itemKind, count);
                }
            } else{
                this._putInventory(itemKind, count);
            }
        },
        _putInventory: function(itemKind, count){
            if(!this.inventory[0]){
                this.inventory[0] = itemKind;
                this.inventoryCount[0] = count;
            } else if(!this.inventory[1]){
                this.inventory[1] = itemKind;
                this.inventoryCount[1] = count;
            } else{
                throw new Exceptions.LootException("Your inventory is currently full.");
            }
        },
        setInventory: function(itemKind, inventoryNumber, number){
            if (number === 0) {
                 this.makeEmptyInventory(inventoryNumber);
                 this.emptyInventoryCompletely();
            }
            
            this.inventory[inventoryNumber] = itemKind;
            this.inventoryCount[inventoryNumber] = number;
        },
        makeEmptyInventory: function(inventoryNumber){
            if(inventoryNumber === 0 || inventoryNumber === 1){
                this.inventory[inventoryNumber] = null;
            }
        },
        emptyInventoryCompletely: function() {
            this.inventory[0] = null;
            this.inventory[1] = null;
        },
        decInventory: function(inventoryNumber){
            var self = this;

            if(this.healingCoolTimeCallback === null){
                this.healingCoolTimeCallback = setTimeout(function(){
                    self.healingCoolTimeCallback = null;
                }, 500);
                this.inventoryCount[inventoryNumber] -= 1;
                if(this.inventoryCount[inventoryNumber] <= 0){
                    this.inventory[inventoryNumber] = null;
                }
                return true;
            }
            return false;
        },
        magicCoolTimeCheck: function(){
          var self = this;
          if(this.magicCoolTimeCallback === null){
            this.magicCoolTimeCallback = setTimeout(function(){
              self.magicCoolTimeCallback = null;
            }, 10000000);
            return true;
          }
          return false;
        },
        /**
         * Returns true if the character is currently walking towards an item in order to loot it.
         */
        isMovingToLoot: function() {
            return this.isLootMoving;
        },

        getSpriteName: function() {
            return this.spriteName;
        },

        setSpriteName: function(name) {
            this.spriteName = name;
        },

        getArmorName: function() {
            var sprite = this.getArmorSprite();
            return sprite.id;
        },

        getArmorSprite: function() {
            if(this.invincible) {
                return this.currentArmorSprite;
            } else {
                return this.sprite;
            }
        },
        setArmorName: function(name){
            this.armorName = name;
        },

        getWeaponName: function() {
            return this.weaponName;
        },
        
        setWeaponName: function(name) {
            this.weaponName = name;
        },

        hasWeapon: function() {

            return this.weaponName !== null;
        },
        
         equipFromInventory: function(type, inventoryNumber, sprites){
            var itemString = Types.getKindAsString(this.inventory[inventoryNumber]);
            var currentArmour = Types.getKindFromString(this.getArmorName());

            /*if(this.level > 100){
                      
                    } else{
                      rank = Types.getArmorRank(item.kind);
                      currentRank = Types.getArmorRank(Types.getKindFromString(this.armorName));
                      msg = "You are wielding a better armor";
                      var rankRequirement = (rank * 5) + rank;
                      if(rank && currentRank) {
                        if(rank === currentRank) {
                            throw new Exceptions.LootException("You already have this "+item.type);
                        } else if (this.level < rankRequirement) {
                            throw new Exceptions.LootException("You need to be level " + rankRequirement + " to wield this.");
                        } else if(rank <= currentRank) {
                            throw new Exceptions.LootException(msg);
                        }
                      }
                    }*/
            if(itemString){
                var itemSprite = sprites[itemString];
                if(itemSprite){
                   
                        
                        if(type === "armor") {


                            this.inventory[inventoryNumber] = Types.getKindFromString(this.getArmorName());
                            
                            this.switchArmor(itemString, itemSprite);
                            

                        } else if(type === "avatar"){
                            
                            this.inventory[inventoryNumber] = null;
                            
                            this.setSpriteName(itemString);
                            this.setSprite(itemSprite);
                            
                        }
                    
                }
            }
        },
        switchArmor: function(armorName, sprite){
            this.setSpriteName(armorName);
            this.setSprite(sprite);
            this.setArmorName(armorName);
            if(this.switch_callback) {
              this.switch_callback();
            }
        },
    
        switchWeapon: function(newWeaponName) {
            var count = 14, 
                value = false, 
                self = this;
        
            var toggle = function() {
                value = !value;
                return value;
            };
        
            if(newWeaponName !== this.getWeaponName()) {
                if(this.isSwitchingWeapon) {
                    clearInterval(blanking);
                }
            
                this.switchingWeapon = true;
                var blanking = setInterval(function() {
                    if(toggle()) {
                        self.setWeaponName(newWeaponName);
                    } else {
                        self.setWeaponName(null);
                    }

                    count -= 1;
                    if(count === 1) {
                        clearInterval(blanking);
                        self.switchingWeapon = false;
                    
                        if(self.switch_callback) {
                            self.switch_callback();
                        }
                    }
                }, 90);
            }
        },

        switchArmor: function(newArmorSprite) {
            var count = 14,
                value = false,
                self = this;

            var toggle = function() {
                value = !value;
                return value;
            };

            if(newArmorSprite && newArmorSprite.id !== this.getSpriteName()) {
                if(this.isSwitchingArmor) {
                    clearInterval(blanking);
                }

                this.isSwitchingArmor = true;
                self.setSprite(newArmorSprite);
                self.setSpriteName(newArmorSprite.id);
                var blanking = setInterval(function() {
                    self.setVisible(toggle());

                    count -= 1;
                    if(count === 1) {
                        clearInterval(blanking);
                        self.isSwitchingArmor = false;

                        if(self.switch_callback) {
                            self.switch_callback();
                        }
                    }
                }, 90);
            }
        },

        onArmorLoot: function(callback) {
            this.armorloot_callback = callback;
        },

        onSwitchItem: function(callback) {
            this.switch_callback = callback;
        },

        onInvincible: function(callback) {
            this.invincible_callback = callback;
        },
        
        startInvincibility: function() {
            var self = this;

            if(!this.invincible) {
                this.currentArmorSprite = this.getSprite();
                this.invincible = true;
                this.invincible_callback();
            } else {
                // If the player already has invincibility, just reset its duration.
                if(this.invincibleTimeout) {
                    clearTimeout(this.invincibleTimeout);
                }
            }

            this.invincibleTimeout = setTimeout(function() {
                self.stopInvincibility();
                self.idle();
            }, 7500);
        },

        stopInvincibility: function() {
            this.invincible_callback();
            this.invincible = false;

            if(this.currentArmorSprite) {
                this.setSprite(this.currentArmorSprite);
                this.setSpriteName(this.currentArmorSprite.id);
                this.currentArmorSprite = null;
            }
            if(this.invincibleTimeout) {
                clearTimeout(this.invincibleTimeout);
            }
         },
        flagPVP: function(pvpFlag){
            this.pvpFlag = pvpFlag;
       }
    });

    return Player;
});