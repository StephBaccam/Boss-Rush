export default class Orc extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "orc");

        // Ajouter l'orc à la scène
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Ajuster les propriétés physiques
        this.setCollideWorldBounds(true);
        this.setSize(12, 18);
        this.setOffset(44, 40);
        this.setScale(3);
        this.setFlipX(true);

        this.speed = 50; // Vitesse de déplacement de l'orc
        this.attackRange = 50 * 1.2; // 1.2x la portée d'attaque du joueur
        this.isAttacking = false;

        // Rendre l'orc immobile pour éviter qu'il soit poussé
        this.setImmovable(true);

        // Santé de l'orc
        this.maxHealth = this.health = 300;

        // Ajouter les animations
        this.createAnimations(scene);
        
        // Jouer l'animation d'attente
        this.play("idle-orc");
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "idle-orc",
            frames: scene.anims.generateFrameNumbers("orc", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1
        });

        scene.anims.create({
            key: "walk-orc",
            frames: scene.anims.generateFrameNumbers("orc", { start: 8, end: 15 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: "attack-orc",
            frames: scene.anims.generateFrameNumbers("orc", { start: 16, end: 21 }),
            frameRate: 10,
            repeat: 0
        });
    }

    update(player) {
        if (this.isAttacking) return; // Ne bouge pas s'il attaque

        let distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance > this.attackRange) {
            // Se déplace vers le joueur
            if (!this.isAttacking) {
                this.play(this.body.velocity.x !== 0 ? "walk-orc" : "idle-orc", true);
            }
            this.scene.physics.moveToObject(this, player, this.speed);
        } else {
            // Arrêter l'orc avant d'attaquer
            this.setVelocityX(0);
            this.setVelocityY(0);

            this.isAttacking = true;

            // Attendre 0.2 secondes avant d'attaquer
            this.scene.time.delayedCall(300, () => {
                this.play("attack-orc", true);

                // Appliquer les dégâts ici si nécessaire
                if (distance < this.attackRange) {
                    console.log("L'orc attaque !");
                }

                // Attendre 0.2 secondes après l'attaque avant de recommencer à bouger
                this.scene.time.delayedCall(700, () => {
                    this.isAttacking = false;
                });
            });
        }
    }
}