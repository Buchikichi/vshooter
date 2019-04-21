class FlexibleView {
	constructor(width, height) {
		this.view = document.getElementById('view');
		this.canvas = document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.scale = 1;
		this.init();
		this.setSize(width, height);
		FlexibleView.Instance = this;
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		this.resize();
	}

	init() {
		let header = document.querySelector('[data-role="header"]');
		let footer = document.querySelector('[data-role="footer"]');

		this.headerHeight = header ? header.offsetHeight : 0;
		this.footerHeight = footer ? footer.offsetHeight : 0;
		this.margin = this.headerHeight + this.footerHeight;
//console.log('headerH:' + headerHeight);
		window.addEventListener('resize', ()=> {
			this.resize();
		});
		window.addEventListener('keydown', ()=> {
			if (!this.view.classList.contains('addicting')) {
				this.view.classList.add('addicting');
			}
		});
		window.addEventListener('mousemove', ()=> {
			this.view.classList.remove('addicting');
		});
	}

	resize() {
		let scaleW = document.body.clientWidth / this.width;
		let scaleH = (window.innerHeight - this.margin) / this.height;

		this.scale = scaleH < scaleW ? scaleH : scaleW;
		// transform: scale(2);
//console.log('scale:' + this.scale);
		let style = [
			'width:' + this.width + 'px',
			'height:' + this.height + 'px',
			'transform: scale(' + this.scale + ')',
		];
		this.view.setAttribute('style', style.join(';'));
	}

	convert(x, y) {
		let cx = x / this.scale;
		let cy = (y - this.headerHeight) / this.scale;

		return {x: cx, y: cy};
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}
