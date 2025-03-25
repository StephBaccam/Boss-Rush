export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "soldier");

        // Ajouter le joueur à la scène
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Ajuster les propriétés physiques
        this.setCollideWorldBounds(true);
        this.setSize(12, 18);
        this.setOffset(44, 40);
        this.setScale(1.5);
        this.body.gravity.y = 800;

        // État d'attaque
        this.isAttacking = false;

        // Ajouter les animations
        this.createAnimations(scene);
        
        // Lancer l'animation d'attente
        this.play("idle");
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "walk",
            frames: scene.anims.generateFrameNumbers("soldier", { start: 9, end: 16 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: "idle",
            frames: scene.anims.generateFrameNumbers("soldier", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1
        });

        scene.anims.create({
            key: "attack",
            frames: scene.anims.generateFrameNumbers("soldier", { start: 18, end: 23 }),
            frameRate: 10,
            repeat: 0
        });
    }

    move(keys) {
        if (keys.left.isDown) {
            this.setVelocityX(-150);
            this.setFlipX(true);
        } else if (keys.right.isDown) {
            this.setVelocityX(150);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        if (keys.up.isDown && this.body.blocked.down) {
            this.setVelocityY(-300);
        }

        if (!this.body.blocked.down && keys.down.isDown) {
            this.setVelocityY(300);
        }

        if (!this.isAttacking) {
            this.play(this.body.velocity.x !== 0 ? "walk" : "idle", true);
        }
    }

    attack(enemy, updateHealthBar) {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.play("attack", true);
            
            this.once("animationcomplete", () => {
                this.isAttacking = false;
            });

            let attackRange = 50;
            let distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);

            if (distance < attackRange) {
                console.log("HP de l'orc avant : ", enemy.health);
                enemy.health -= 10; // Réduction des HP (ajuste selon tes besoins)
                console.log("HP de l'orc après : ", enemy.health);

                updateHealthBar(enemy.health / enemy.maxHealth);

                if (enemy.health <= 0) {
                    enemy.destroy();
                    console.log("L'ennemi est mort !");
                }
            }
        }
    }
}