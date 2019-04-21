class Region {
	constructor(matter, size = Region.DefaultSize, type = Region.Type.CIRCLE) {
		this.matter = matter;
		this.size = size;
		this.type = type;
		this.width = size * 2;
	}

	isHit(target) {
		if (this.type == Region.Type.CIRCLE) {
			if (target.type == Region.Type.CIRCLE) {
				let wX = this.matter.x - target.matter.x;
				let wY = this.matter.y - target.matter.y;
				let distance = Math.sqrt(wX * wX + wY * wY);

				return distance < this.size + target.size;
			}
		}
console.log('*Not implement*');
	}

	draw(ctx) {
		ctx.save();
		ctx.strokeStyle = 'rgba(80, 255, 80, 0.6)';
		if (this.type == Region.Type.RECTANGLE) {
			ctx.strokeRect(-this.size, -this.size, this.width, this.width);
		} else {
			ctx.beginPath();
			ctx.arc(0, 0, this.size, 0, Math.PI2, false);
			ctx.stroke();
		}
		ctx.restore();
	}
}
Region.DefaultSize = 4;
Region.Type = {
	CIRCLE: 1,
	RECTANGLE: 2,
};
