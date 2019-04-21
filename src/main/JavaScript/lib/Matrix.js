/**
 * Matrix.
 * @author Hidetaka Sasai
 */
function Matrix(mat) {
	this.mat = mat;
}
Matrix.NO_EFFECT = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];

Matrix.rotateX = function(r) {
	return new Matrix([[1,0,0,0],[0,Math.cos(r),-Math.sin(r),0],[0,Math.sin(r),Math.cos(r),0],[0,0,0,1]]);
};

Matrix.rotateY = function(r) {
	return new Matrix([[Math.cos(r),0,Math.sin(r),0],[0,1,0,0],[-Math.sin(r),0,Math.cos(r),0],[0,0,0,1]]);
};

Matrix.rotateZ = function(r) {
	return new Matrix([[Math.cos(r),-Math.sin(r),0,0],[Math.sin(r),Math.cos(r),0,0],[0,0,1,0],[0,0,0,1]]);
};

/**
 * Multiply.
 * @param multiplicand matrix
 */
Matrix.prototype.multiply = function(multiplicand) {
	var result = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
	var m = multiplicand.mat;

	this.mat.forEach(function(row, i) {
		row.forEach(function(col, j) {
			var sum = 0;

			for (var cnt = 0; cnt < 4; cnt++) {
				sum += row[cnt] * m[cnt][j];
			}
			result[i][j] = sum;
		});
	});
	return new Matrix(result);
};

Matrix.prototype.affine = function(x, y, z) {
	var m = this.mat;
	var nx = m[0][0] * x + m[0][1] * y + m[0][2] * z + m[0][3];
	var ny = m[1][0] * x + m[1][1] * y + m[1][2] * z + m[1][3];
	var nz = m[2][0] * x + m[2][1] * y + m[2][2] * z + m[2][3];

	return {x:nx, y:ny, z:nz};
};
