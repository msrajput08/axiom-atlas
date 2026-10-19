import json
C=[]
def f(cat,slug,title,desc,fields,outputs,formula='',note=''):
    # field format name|Label|default|unit, output Label|expression|unit
    ins=[]
    for x in fields.split(';'):
        if not x: continue
        p=x.split('|'); ins.append({'key':p[0],'label':p[1],'default':p[2] if len(p)>2 else '', 'unit':p[3] if len(p)>3 else ''})
    outs=[]
    for x in outputs.split(';'):
        if not x:continue
        p=x.split('|'); outs.append({'label':p[0],'expr':p[1],'unit':p[2] if len(p)>2 else ''})
    C.append({'category':cat,'slug':slug,'title':title,'description':desc,'type':'formula','fields':ins,'outputs':outs,'formula':formula,'note':note})
def s(cat,slug,title,desc,typ,formula='',note=''):
    C.append({'category':cat,'slug':slug,'title':title,'description':desc,'type':typ,'fields':[], 'outputs':[], 'formula':formula,'note':note})
# Specialized platforms
s('Math & numbers','scientific-calculator','Scientific Calculator','Evaluate scientific expressions, exponents, trigonometry, logarithms and more.','scientific','Arithmetic, trig, logs, roots, combinations and constants.')
s('Algebra','equation-solver','Equation Solver','Solve linear, quadratic and general single-variable equations numerically and see real roots.','equation','Numerical root finding scans a finite interval; some functions have additional roots or no real roots.')
s('Algebra','quadratic-equation','Quadratic Equation Solver','Solve ax² + bx + c = 0, including complex roots.','quadratic','x = (−b ± √(b² − 4ac))/(2a)')
s('Algebra','linear-system','Simultaneous Equation Solver','Solve 2×2 and 3×3 systems of linear equations.','system','Gaussian elimination with pivoting.')
s('Algebra','expression-simplifier','Expression Evaluator','Evaluate or sample a math expression after substituting variable values.','expression','Numeric evaluation only; not a general symbolic CAS.')
s('Graphing & calculus','graphing-calculator','Function Graphing Calculator','Plot functions y=f(x) and compare up to three graphs interactively.','graph','Cartesian function plot; drag, zoom and download PNG.')
s('Graphing & calculus','derivative-calculator','Derivative Calculator','Estimate derivatives at a point and draw tangent lines.','derivative','f′(x) ≈ (f(x+h) − f(x−h))/(2h). Numerical estimate, not symbolic differentiation.')
s('Graphing & calculus','integral-calculator','Definite Integral Calculator','Numerically evaluate definite integrals using composite Simpson integration.','integral','Composite Simpson’s rule; discontinuities and singularities may invalidate the result.')
s('Graphing & calculus','limit-calculator','Numerical Limit Calculator','Estimate the left- and right-hand limits of a function.','limit','Numerical sampling near a point; not a proof of a limit.')
s('Linear algebra','matrix-calculator','Matrix Calculator','Add, multiply, transpose, invert and find determinants of matrices.','matrix','Gaussian elimination and standard matrix operations.')
s('Statistics','statistics-calculator','Statistics Calculator','Compute mean, median, mode, variance, deviation, quartiles and more.','stats','Sample and population statistics shown separately.')
s('Statistics','correlation-calculator','Correlation & Regression','Calculate Pearson correlation and a least-squares regression line.','regression','Pearson r and least-squares line; association does not establish causation.')
s('Statistics','probability-calculator','Binomial Probability','Calculate exact binomial probabilities with n trials and success rate p.','binomial','P(X=k) = C(n,k)p^k(1−p)^(n−k).')
s('Converters','unit-converter','Universal Unit Converter','Convert length, area, volume, mass, speed, time, pressure, energy, power, data, angle and temperature.','converter','Uses common standard conversion factors; some units are context-dependent.')
s('Computing','number-base-converter','Number Base Converter','Convert integers between binary, octal, decimal, hexadecimal and bases 2–36.','base','Exact integers using BigInt; fractional bases not supported.')
s('Math & numbers','fraction-calculator','Fraction Calculator','Add, subtract, multiply, divide and simplify fractions exactly.','fraction','Exact integer arithmetic with BigInt.')
s('Math & numbers','prime-checker','Prime Number Checker','Determine whether an integer is prime and list its small factors.','prime','Trial division for integers up to 10^12.')
s('Date & time','date-difference','Date Difference Calculator','Calculate the precise day and week difference between two dates.','dates','Calendar day count in UTC prevents DST-related errors.')
s('Date & time','age-calculator','Age Calculator','Calculate age in years, months and days from a birth date.','age','Calendar-accurate age with months of varying length.')
s('Math & numbers','random-number-generator','Random Number Generator','Generate random integers in a chosen interval.','random','Uses browser cryptographic randomness when supported.')
s('Trigonometry','trigonometry-calculator','Trigonometry Calculator','Compute sine, cosine, tangent, inverse trig and reciprocal ratios.','trig','Angles can be degrees or radians.')
s('Linear algebra','vector-calculator','Vector Calculator','Compute 3D dot products, cross products, magnitudes and angle.','vector','The dot product equals |a||b|cos θ.')
s('Computing','color-converter','HEX / RGB Color Converter','Convert HEX colors to RGB and HSL with a live color swatch.','color','RGB and HSL conversion uses sRGB values.')
# Math & numbers
f('Math & numbers','percentage-calculator','Percentage Calculator','Find a percentage of any number.','p|Percentage|15|%;n|Number|240','Result|p*n/100','P = (% / 100) × number')
f('Math & numbers','percent-change','Percentage Change Calculator','Compare an old and a new value with percentage change.','old|Original value|80;new|New value|100','Change|new-old;Percent change|100*(new-old)/old|%','((new − old) / old) × 100')
f('Math & numbers','percent-difference','Percentage Difference Calculator','Compare two values relative to their average.','a|First value|64;b|Second value|80','Difference|abs(a-b);Percent difference|200*abs(a-b)/(abs(a)+abs(b))|%','|a − b| / ((|a|+|b|)/2) × 100')
f('Math & numbers','ratio-calculator','Ratio Calculator','Calculate a ratio and the share represented by each part.','a|First part|3;b|Second part|5','A/B|a/b;A share|100*a/(a+b)|%;B share|100*b/(a+b)|%','a:b; A share = a/(a+b)')
f('Math & numbers','proportion-calculator','Proportion Calculator','Solve a/b = c/x for an unknown fourth value.','a|a|3;b|b|4;c|c|9','x|b*c/a','a/b = c/x → x = bc/a')
f('Math & numbers','weighted-average','Weighted Average Calculator','Find an average using weights for three numbers.','a|Value 1|80;wa|Weight 1|2;b|Value 2|90;wb|Weight 2|3;c|Value 3|70;wc|Weight 3|1','Weighted average|(a*wa+b*wb+c*wc)/(wa+wb+wc)','Σ(value × weight) / Σ(weight)')
f('Math & numbers','nth-root','Nth Root Calculator','Find the nth root of a nonnegative value.','x|Number|256;n|Root degree|4','Root|x^(1/n)','x^(1/n). For even n, x must be nonnegative.','For negative x with odd n, use a scientific calculator.')
f('Math & numbers','power-calculator','Power & Exponent Calculator','Raise a base to any power.','a|Base|2;b|Exponent|8','Result|a^b','a^b')
f('Math & numbers','logarithm-calculator','Logarithm Calculator','Calculate a logarithm with an arbitrary base.','x|Number|1000;b|Base|10','Logarithm|log(x)/log(b)','log_b(x) = ln(x) / ln(b)')
f('Math & numbers','factorial-calculator','Factorial Calculator','Calculate factorial of a nonnegative integer.','n|Nonnegative integer|6','Factorial|fact(n)','n! = n×(n−1)×…×1','Integers 0 to 170 are supported for finite numeric output.')
f('Math & numbers','permutation-calculator','Permutation Calculator','Count ordered arrangements of r objects chosen from n.','n|Total items n|8;r|Items selected r|3','Permutations|perm(n,r)','P(n,r) = n!/(n−r)!')
f('Math & numbers','combination-calculator','Combination Calculator','Count ways to choose r items from n without ordering.','n|Total items n|8;r|Items selected r|3','Combinations|comb(n,r)','C(n,r) = n!/(r!(n−r)!)')
f('Math & numbers','gcd-calculator','GCD Calculator','Find the greatest common divisor of two integers.','a|First integer|84;b|Second integer|30','GCD|gcd(a,b)','Euclidean algorithm')
f('Math & numbers','lcm-calculator','LCM Calculator','Find the lowest common multiple of two integers.','a|First integer|12;b|Second integer|18','LCM|abs(a*b)/gcd(a,b)','LCM(a,b) = |ab|/GCD(a,b)')
f('Math & numbers','modulo-calculator','Modulo Calculator','Find the Euclidean remainder after division.','a|Dividend|29;b|Divisor|6','Remainder|mod(a,b);Quotient|floor(a/b)','a = qb + r')
f('Math & numbers','arithmetic-mean','Arithmetic Mean Calculator','Calculate the mean of four values.','a|Number 1|10;b|Number 2|15;c|Number 3|25;d|Number 4|30','Mean|(a+b+c+d)/4;Sum|a+b+c+d','Mean = sum / count')
f('Math & numbers','geometric-mean','Geometric Mean Calculator','Calculate the geometric mean of positive numbers.','a|Value 1|2;b|Value 2|8;c|Value 3|32','Geometric mean|(a*b*c)^(1/3)','(a×b×c)^(1/3)','Inputs should be positive.')
# Algebra
f('Algebra','linear-equation','Linear Equation Calculator','Solve ax + b = c for x.','a|Coefficient a|3;b|Constant b|5;c|Right side c|20','x|(c-b)/a','ax + b = c → x = (c − b)/a')
f('Algebra','polynomial-evaluation','Polynomial Value Calculator','Evaluate a cubic polynomial ax³+bx²+cx+d.','a|a|2;b|b|-3;c|c|4;d|d|-7;x|x|2','P(x)|a*x^3+b*x^2+c*x+d','P(x) = ax³ + bx² + cx + d')
f('Algebra','arithmetic-sequence','Arithmetic Sequence Calculator','Calculate the nth term and sum of an arithmetic progression.','a|First term|4;d|Common difference|3;n|Term count|12','nth term|a+(n-1)*d;Sum|n*(2*a+(n-1)*d)/2','a_n = a+(n−1)d; S_n = n(2a+(n−1)d)/2')
f('Algebra','geometric-sequence','Geometric Sequence Calculator','Calculate the nth term and finite sum of a geometric progression.','a|First term|2;r|Common ratio|1.5;n|Term count|8','nth term|a*r^(n-1);Sum|a*(1-r^n)/(1-r)','a_n = ar^(n−1); S_n = a(1−r^n)/(1−r)','The finite-sum expression requires r ≠ 1.')
f('Algebra','slope-calculator','Slope Calculator','Find the slope and rise/run from two points.','x1|Point 1 x|2;y1|Point 1 y|3;x2|Point 2 x|6;y2|Point 2 y|11','Slope|(y2-y1)/(x2-x1);Rise|y2-y1;Run|x2-x1','m = (y₂−y₁)/(x₂−x₁)')
f('Algebra','midpoint-calculator','Midpoint Calculator','Calculate the midpoint of a line segment.','x1|x₁|2;y1|y₁|6;x2|x₂|8;y2|y₂|10','Midpoint x|(x1+x2)/2;Midpoint y|(y1+y2)/2','M = ((x₁+x₂)/2, (y₁+y₂)/2)')
f('Algebra','distance-between-points','2D Distance Calculator','Find the Euclidean distance between two points.','x1|x₁|2;y1|y₁|1;x2|x₂|8;y2|y₂|9','Distance|sqrt((x2-x1)^2+(y2-y1)^2)','d = √((x₂−x₁)² + (y₂−y₁)²)')
f('Algebra','exponential-growth','Exponential Growth Calculator','Model continuous exponential growth or decay.','p|Initial value|1000;r|Rate (% per unit)|5;t|Time units|3','Final value|p*e^(r*t/100);Change|p*(e^(r*t/100)-1)','A = P e^(rt)')
# Geometry
f('Geometry','rectangle-calculator','Rectangle Calculator','Find area, perimeter and diagonal of a rectangle.','l|Length|12|m;w|Width|8|m','Area|l*w|m²;Perimeter|2*(l+w)|m;Diagonal|sqrt(l^2+w^2)|m','A = lw; P = 2(l+w)')
f('Geometry','square-calculator','Square Calculator','Calculate square area, perimeter and diagonal.','s|Side|8|m','Area|s^2|m²;Perimeter|4*s|m;Diagonal|s*sqrt(2)|m','A=s²; P=4s; d=s√2')
f('Geometry','triangle-calculator','Triangle Area Calculator','Find the area of a triangle from base and height.','b|Base|12|m;h|Height|7|m','Area|b*h/2|m²','A = ½bh')
f('Geometry','herons-formula','Heron’s Formula Calculator','Find triangle area from three side lengths.','a|Side a|5;b|Side b|6;c|Side c|7','Semiperimeter|(a+b+c)/2;Area|sqrt(((a+b+c)/2)*((a+b+c)/2-a)*((a+b+c)/2-b)*((a+b+c)/2-c))','A = √(s(s−a)(s−b)(s−c)), s=(a+b+c)/2','The triangle inequality must hold.')
f('Geometry','circle-calculator','Circle Calculator','Find area and circumference from radius.','r|Radius|7|m','Area|pi*r^2|m²;Circumference|2*pi*r|m;Diameter|2*r|m','A=πr²; C=2πr')
f('Geometry','ellipse-calculator','Ellipse Calculator','Calculate area and approximate perimeter of an ellipse.','a|Semimajor axis|8|m;b|Semiminor axis|5|m','Area|pi*a*b|m²;Perimeter estimate|pi*(3*(a+b)-sqrt((3*a+b)*(a+3*b)))|m','Area = πab; perimeter uses Ramanujan approximation.')
f('Geometry','trapezoid-calculator','Trapezoid Area Calculator','Calculate trapezoid area from parallel sides and height.','a|Upper base|6;b|Lower base|12;h|Height|5','Area|(a+b)*h/2','A = (a+b)h/2')
f('Geometry','parallelogram-calculator','Parallelogram Area Calculator','Find area and perimeter of a parallelogram.','b|Base|10;h|Height|6;s|Other side|7','Area|b*h;Perimeter|2*(b+s)','A = bh; P = 2(b+s)')
f('Geometry','sector-calculator','Circle Sector Calculator','Calculate sector area and arc length in degrees.','r|Radius|10;angle|Central angle|60|°','Sector area|pi*r^2*angle/360;Arc length|2*pi*r*angle/360','A = πr²θ/360; arc = 2πrθ/360')
f('Geometry','pythagorean-calculator','Pythagorean Theorem Calculator','Find the hypotenuse of a right triangle.','a|Leg a|3;b|Leg b|4','Hypotenuse|sqrt(a^2+b^2)','c = √(a²+b²)')
f('Geometry','cube-calculator','Cube Calculator','Find cube volume, surface area and space diagonal.','a|Side|6','Volume|a^3;Surface area|6*a^2;Space diagonal|a*sqrt(3)','V=a³; A=6a²')
f('Geometry','cuboid-calculator','Rectangular Prism Calculator','Calculate volume, surface area and diagonal of a box.','l|Length|8;w|Width|4;h|Height|3','Volume|l*w*h;Surface area|2*(l*w+l*h+w*h);Diagonal|sqrt(l^2+w^2+h^2)','V=lwh; A=2(lw+lh+wh)')
f('Geometry','sphere-calculator','Sphere Calculator','Compute sphere volume and surface area.','r|Radius|5','Volume|4*pi*r^3/3;Surface area|4*pi*r^2','V = 4πr³/3; A=4πr²')
f('Geometry','cylinder-calculator','Cylinder Calculator','Calculate cylinder volume and total surface area.','r|Radius|4;h|Height|10','Volume|pi*r^2*h;Surface area|2*pi*r*(r+h)','V=πr²h; A=2πr(r+h)')
f('Geometry','cone-calculator','Cone Calculator','Calculate cone volume, slant height and total area.','r|Radius|3;h|Height|8','Volume|pi*r^2*h/3;Slant height|sqrt(r^2+h^2);Surface area|pi*r*(r+sqrt(r^2+h^2))','V=πr²h/3; A=πr(r+l)')
f('Geometry','pyramid-calculator','Square Pyramid Calculator','Find volume and total surface area of a square pyramid.','s|Base side|6;h|Vertical height|8','Volume|s^2*h/3;Surface area|s^2+2*s*sqrt(h^2+s^2/4)','V=s²h/3; A=s²+2sl')
f('Geometry','torus-calculator','Torus Calculator','Compute a torus volume and surface area.','r|Tube radius|2;R|Major radius|6','Volume|2*pi^2*R*r^2;Surface area|4*pi^2*R*r','V=2π²Rr²; A=4π²Rr','Requires major radius > tube radius for a ring torus.')
f('Geometry','regular-polygon','Regular Polygon Calculator','Find area and perimeter of a regular polygon.','n|Number of sides|6;s|Side length|5','Perimeter|n*s;Area|n*s^2/(4*tan(pi/n))','A = ns²/(4tan(π/n)), n≥3')
# Trig
f('Trigonometry','degree-radian','Degree to Radian Converter','Convert angles from degrees to radians and turns.','d|Angle in degrees|180','Radians|d*pi/180|rad;Turns|d/360|turn','radians = degrees × π/180')
f('Trigonometry','arc-length','Arc Length Calculator','Find circle arc length from radius and angle.','r|Radius|7;deg|Angle|90|°','Arc length|r*pi*deg/180','s=rθ with θ in radians')
f('Trigonometry','law-of-cosines','Law of Cosines Calculator','Calculate the third side of a triangle from two sides and their included angle.','a|Side a|7;b|Side b|9;C|Included angle|60|°','Opposite side c|sqrt(a^2+b^2-2*a*b*cos(C*pi/180))','c² = a²+b²−2ab cos(C)')
f('Trigonometry','law-of-sines','Law of Sines Calculator','Find an unknown triangle side given one opposite side-angle pair.','a|Known side a|7;A|Angle A|30|°;B|Angle B|45|°','Side b|a*sin(B*pi/180)/sin(A*pi/180)','a/sin(A) = b/sin(B)','Angle A and B must sum to less than 180°.')
# Physics
f('Physics','speed-calculator','Speed Calculator','Find average speed from distance and elapsed time.','d|Distance|150|m;t|Time|12|s','Speed|d/t|m/s;Speed km/h|3.6*d/t|km/h','v=d/t')
f('Physics','distance-calculator','Distance Calculator','Calculate distance traveled at constant speed.','v|Speed|16|m/s;t|Time|30|s','Distance|v*t|m','d=vt')
f('Physics','acceleration-calculator','Acceleration Calculator','Calculate acceleration from initial and final velocities.','u|Initial velocity|5|m/s;v|Final velocity|25|m/s;t|Elapsed time|4|s','Acceleration|(v-u)/t|m/s²','a=(v−u)/t')
f('Physics','displacement-calculator','Displacement Calculator','Find displacement with constant acceleration.','u|Initial speed|10|m/s;t|Time|5|s;a|Acceleration|2|m/s²','Displacement|u*t+a*t^2/2|m;Final speed|u+a*t|m/s','s=ut+½at²')
f('Physics','force-calculator','Force Calculator','Calculate force using Newton’s second law.','m|Mass|12|kg;a|Acceleration|3|m/s²','Force|m*a|N','F=ma')
f('Physics','work-calculator','Work Calculator','Find work from force, displacement and angle.','F|Force|100|N;d|Distance|5|m;deg|Angle|30|°','Work|F*d*cos(deg*pi/180)|J','W=Fd cos(θ)')
f('Physics','kinetic-energy','Kinetic Energy Calculator','Find kinetic energy from mass and velocity.','m|Mass|10|kg;v|Speed|6|m/s','Kinetic energy|m*v^2/2|J','KE=½mv²')
f('Physics','potential-energy','Gravitational Potential Energy','Calculate gravitational potential energy near Earth’s surface.','m|Mass|5|kg;g|Gravity|9.80665|m/s²;h|Height|10|m','Potential energy|m*g*h|J','PE=mgh')
f('Physics','momentum-calculator','Momentum Calculator','Calculate linear momentum from mass and velocity.','m|Mass|8|kg;v|Velocity|4|m/s','Momentum|m*v|kg·m/s','p=mv')
f('Physics','density-calculator','Density Calculator','Find density, mass or volume relationship.','m|Mass|600|kg;V|Volume|0.3|m³','Density|m/V|kg/m³','ρ=m/V')
f('Physics','pressure-calculator','Pressure Calculator','Calculate pressure from force and area.','F|Force|800|N;A|Area|0.4|m²','Pressure|F/A|Pa','P=F/A')
f('Physics','mechanical-power','Power Calculator','Find power from work done over elapsed time.','W|Work done|1000|J;t|Time|20|s','Power|W/t|W','P=W/t')
f('Physics','ohms-law','Ohm’s Law Calculator','Calculate current and power from voltage and resistance.','V|Voltage|12|V;R|Resistance|6|Ω','Current|V/R|A;Power|V^2/R|W','I=V/R; P=V²/R')
f('Physics','electrical-power','Electrical Power Calculator','Find electrical power and energy use.','V|Voltage|230|V;I|Current|2|A;t|Hours|5|h','Power|V*I|W;Energy|V*I*t/1000|kWh','P=VI; E=P×t')
f('Physics','wave-speed','Wave Speed Calculator','Find wave velocity from frequency and wavelength.','f|Frequency|440|Hz;l|Wavelength|0.78|m','Wave speed|f*l|m/s','v=fλ')
f('Physics','frequency-period','Frequency & Period Calculator','Find the period for any positive frequency.','f|Frequency|50|Hz','Period|1/f|s;Angular frequency|2*pi*f|rad/s','T=1/f; ω=2πf')
f('Physics','pendulum-period','Simple Pendulum Calculator','Estimate small-angle pendulum period.','L|Length|1|m;g|Gravity|9.80665|m/s²','Period|2*pi*sqrt(L/g)|s;Frequency|1/(2*pi*sqrt(L/g))|Hz','T≈2π√(L/g)','Valid for small oscillation angles, idealized pendulum.')
f('Physics','projectile-range','Projectile Motion Calculator','Estimate ideal projectile range and flight time at equal launch/landing heights.','v|Launch speed|20|m/s;angle|Launch angle|45|°;g|Gravity|9.80665|m/s²','Range|v^2*sin(2*angle*pi/180)/g|m;Flight time|2*v*sin(angle*pi/180)/g|s;Maximum height|v^2*sin(angle*pi/180)^2/(2*g)|m','R = v²sin(2θ)/g','Ignoring air resistance; same launch and landing elevation.')
f('Physics','gravitational-force','Universal Gravitation Calculator','Calculate gravitational force between two masses.','m1|Mass one|1000|kg;m2|Mass two|500|kg;r|Distance|2|m','Force|6.6743e-11*m1*m2/r^2|N','F=Gm₁m₂/r²')
f('Physics','heat-energy','Heat Energy Calculator','Estimate heat required to change temperature without phase change.','m|Mass|2|kg;c|Specific heat|4184|J/(kg·K);dT|Temperature change|10|K','Heat energy|m*c*dT|J','Q=mcΔT')
f('Physics','ideal-gas','Ideal Gas Law Calculator','Calculate pressure for an ideal gas.','n|Moles|1|mol;T|Temperature|300|K;V|Volume|0.025|m³','Pressure|n*8.314462618*T/V|Pa','PV=nRT')
f('Physics','buoyant-force','Buoyant Force Calculator','Find buoyant force based on displaced fluid volume.','rho|Fluid density|1000|kg/m³;V|Displaced volume|0.002|m³;g|Gravity|9.80665|m/s²','Buoyant force|rho*V*g|N','F=ρgV')
f('Physics','torque-calculator','Torque Calculator','Calculate torque from lever arm and force.','r|Lever arm|0.5|m;F|Force|80|N;angle|Angle|90|°','Torque|r*F*sin(angle*pi/180)|N·m','τ=rF sinθ')
f('Physics','spring-force','Hooke’s Law Calculator','Find restoring spring force and stored energy.','k|Spring constant|300|N/m;x|Displacement|0.05|m','Force magnitude|k*abs(x)|N;Stored energy|k*x^2/2|J','|F|=k|x|, E=½kx²')
f('Physics','centripetal-force','Centripetal Force Calculator','Calculate inward force in uniform circular motion.','m|Mass|2|kg;v|Speed|10|m/s;r|Radius|5|m','Force|m*v^2/r|N;Acceleration|v^2/r|m/s²','F=mv²/r')
f('Physics','snells-law','Snell’s Law Calculator','Calculate refracted angle using Snell’s law.','n1|Index medium 1|1;n2|Index medium 2|1.5;ang|Incident angle|30|°','Refracted angle|asin(n1*sin(ang*pi/180)/n2)*180/pi|°','n₁sinθ₁=n₂sinθ₂','If |sinθ₂| > 1, total internal reflection occurs.')
f('Physics','thin-lens','Thin Lens Equation Calculator','Find image distance and magnification for a thin lens.','f|Focal length|10|cm;o|Object distance|30|cm','Image distance|1/(1/f-1/o)|cm;Magnification|-1/(o*(1/f-1/o))','1/f = 1/o + 1/i')
# Statistics
f('Statistics','z-score','Z-Score Calculator','Find how many standard deviations a value differs from the mean.','x|Observed value|85;mean|Mean|70;sd|Standard deviation|10','Z-score|(x-mean)/sd','z=(x−μ)/σ')
f('Statistics','standard-error','Standard Error Calculator','Estimate standard error of the sample mean.','sd|Sample standard deviation|12;n|Sample size|64','Standard error|sd/sqrt(n)','SE=s/√n')
f('Statistics','confidence-interval','95% Confidence Interval Calculator','Estimate a 95% normal-approximation confidence interval for a mean.','mean|Sample mean|120;sd|Sample standard deviation|20;n|Sample size|100','Lower bound|mean-1.96*sd/sqrt(n);Upper bound|mean+1.96*sd/sqrt(n);Margin|1.96*sd/sqrt(n)','Mean ± 1.96×s/√n','Uses z≈1.96 rather than a small-sample t interval.')
f('Statistics','probability-calculator-basic','Basic Probability Calculator','Calculate complement and odds of an event.','p|Probability|0.25','Complement|1-p;Odds for|p/(1-p)','P(not A)=1−P(A), odds=P(A)/(1−P(A))','Enter probability between 0 and 1.')
# Finance
f('Finance','simple-interest','Simple Interest Calculator','Calculate straightforward simple interest and final balance.','p|Principal|10000;r|Annual rate|8|%;t|Time|3|years','Interest|p*r*t/100;Final balance|p*(1+r*t/100)','I=Prt')
f('Finance','compound-interest','Compound Interest Calculator','Grow a principal with periodic compounding.','p|Initial principal|10000;r|Annual rate|8|%;n|Compounds per year|12;t|Years|5','Final balance|p*(1+r/(100*n))^(n*t);Interest|p*((1+r/(100*n))^(n*t)-1)','A=P(1+r/n)^(nt)','Constant annual rate; taxes and fees excluded.')
f('Finance','emi-calculator','Loan EMI Calculator','Estimate equal monthly payments on an amortizing loan.','p|Loan amount|500000;r|Annual interest rate|9|%;years|Loan term|5|years','Monthly EMI|p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1);Total paid|years*12*p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1);Total interest|years*12*p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1)-p','EMI=P·i(1+i)^n/((1+i)^n−1)','Uses positive interest rate; excludes charges, insurance and prepayments.')
f('Finance','sip-calculator','SIP Investment Calculator','Project monthly contributions with a constant assumed return.','p|Monthly investment|5000;r|Annual return|12|%;t|Years|10','Future value|p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200);Contributions|p*12*t;Estimated growth|p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200)-p*12*t','FV=P×((1+i)^n−1)/i×(1+i)','Assumes beginning-of-month investments and constant nominal return; not a forecast.')
f('Finance','roi-calculator','ROI Calculator','Calculate percentage return on an investment.','cost|Initial cost|12000;value|Final value|15000','Net gain|value-cost;ROI|100*(value-cost)/cost|%','ROI=(value−cost)/cost×100')
f('Finance','cagr-calculator','CAGR Calculator','Find the annualized compound growth rate.','initial|Beginning value|10000;final|Ending value|18000;years|Number of years|5','CAGR|100*((final/initial)^(1/years)-1)|%','CAGR=(ending/beginning)^(1/years)−1')
f('Finance','discount-calculator','Discount Calculator','Calculate final price after a percentage discount.','price|Original price|1500;off|Discount|20|%','You save|price*off/100;Final price|price*(1-off/100)','Final=price×(1−discount/100)')
f('Finance','tax-calculator','GST / Sales Tax Calculator','Calculate a tax-inclusive price from net price.','price|Net price|1000;rate|Tax rate|18|%','Tax|price*rate/100;Total with tax|price*(1+rate/100)','Gross=Net×(1+rate/100)','Generic sales tax; not a filing/compliance tool.')
f('Finance','profit-margin','Profit Margin Calculator','Calculate profit, margin and markup from cost and selling price.','cost|Cost|120;sell|Selling price|180','Gross profit|sell-cost;Margin|100*(sell-cost)/sell|%;Markup|100*(sell-cost)/cost|%','Margin=profit/revenue; markup=profit/cost')
f('Finance','break-even','Break-Even Calculator','Find how many units must sell to cover fixed and variable costs.','fixed|Fixed costs|50000;price|Price per unit|400;variable|Variable cost/unit|250','Break-even units|ceil(fixed/(price-variable));Contribution margin|price-variable','Units = fixed costs/(price−variable cost)')
f('Finance','inflation-calculator','Inflation Calculator','Estimate future prices after constant annual inflation.','price|Current amount|1000;infl|Annual inflation rate|5|%;years|Years ahead|10','Future equivalent|price*(1+infl/100)^years;Purchasing power|price/(1+infl/100)^years','Future=present×(1+i)^n')
f('Finance','present-value','Present Value Calculator','Discount a future cash flow to its present equivalent.','future|Future value|10000;r|Discount rate|8|%;years|Years away|5','Present value|future/(1+r/100)^years','PV=FV/(1+r)^n')
f('Finance','future-value-annuity','Future Value of Annuity','Calculate ordinary annuity growth from periodic contributions.','p|Contribution per period|200;r|Rate per period|1|%;n|Number of periods|24','Future value|p*((1+r/100)^n-1)/(r/100)','FV=P((1+i)^n−1)/i','Ordinary end-of-period contributions; requires nonzero rate.')
f('Finance','rule-of-72','Rule of 72 Calculator','Estimate doubling time from an annual percentage growth rate.','r|Annual growth rate|8|%','Estimated years to double|72/r','Years ≈ 72 / annual percentage rate')
f('Finance','tip-calculator','Tip & Bill Split Calculator','Calculate gratuity and split a restaurant bill.','bill|Bill subtotal|850;tip|Tip percent|10|%;people|People splitting|3','Total tip|bill*tip/100;Total bill|bill*(1+tip/100);Per person|bill*(1+tip/100)/people','Total = subtotal×(1+tip/100)')
# education
f('Education','attendance-calculator','Attendance Calculator','Calculate current class attendance and how many more classes you need to reach a target.','att|Classes attended|56;total|Classes held|75;target|Target attendance|75|%','Current attendance|100*att/total|%;Additional classes needed|ceil(max(0,(target*total-100*att)/(100-target)))','n≥(target×total−100×att)/(100−target)','Assumes all new classes attended, target under 100%.')
f('Education','cgpa-percentage','CGPA to Percentage Calculator','Convert CGPA to a percentage with an adjustable institutional multiplier.','cgpa|CGPA|8.5;factor|Institution multiplier|9.5','Estimated percentage|cgpa*factor|%','Percentage ≈ CGPA × conversion factor','Check your own institution’s official conversion rule.')
f('Education','grade-percentage','Marks Percentage Calculator','Calculate exam percentage from obtained and total marks.','obtained|Marks obtained|428;maxmarks|Maximum marks|500','Percentage|100*obtained/maxmarks|%','(Obtained / Maximum) × 100')
f('Education','target-grade','Target Exam Score Calculator','Find the score needed on a remaining exam to reach an overall grade.','current|Current average|75|%;weight|Completed weight|60|%;target|Desired overall|85|%','Required remaining score|(100*target-current*weight)/(100-weight)|%','Required = (100×target−completed%×weight)/(100−weight)','A required score above 100% may be unattainable.')
f('Education','study-time-calculator','Study Time Calculator','Plan total study hours for sessions over multiple weeks.','minutes|Minutes per session|45;days|Sessions per week|5;weeks|Weeks|8','Hours total|minutes*days*weeks/60|hours;Sessions|days*weeks','Hours=(minutes×sessions per week×weeks)/60')
# Computing
f('Computing','download-time','Download Time Calculator','Estimate time to download a file at a constant network rate.','size|File size|1500|MB;speed|Connection speed|40|Mbps','Estimated seconds|size*8/speed|s;Estimated minutes|size*8/(speed*60)|min','Time = file size (megabits) / speed (Mbps)','Network overhead and speed fluctuations excluded; decimal MB assumed.')
f('Computing','data-size-calculator','Data Storage Calculator','Convert between decimal kilobytes, megabytes and gigabytes.','gb|Gigabytes|4','Megabytes|gb*1000|MB;Kilobytes|gb*1000000|kB;Bytes|gb*1000000000|B','Decimal SI: 1 GB = 1000 MB','For binary GiB, use the universal unit converter.')
f('Computing','pixel-density','PPI Calculator','Calculate display pixel density from resolution and diagonal.','w|Width pixels|1920;h|Height pixels|1080;d|Diagonal inches|15.6','PPI|sqrt(w^2+h^2)/d|pixels/in','PPI=√(width²+height²)/diagonal')
f('Computing','aspect-ratio','Aspect Ratio Calculator','Find width-to-height ratio and resize proportionally.','w|Original width|1920;h|Original height|1080;neww|Target width|1280','Aspect (w/h)|w/h;New height|neww*h/w','H₂ = W₂×H₁/W₁')
f('Computing','electricity-cost','Electricity Cost Calculator','Calculate electricity expense from appliance wattage and usage.','W|Power|1000|W;hours|Hours daily|5|h;days|Days|30;rate|Cost per kWh|8','Energy consumed|W*hours*days/1000|kWh;Estimated cost|W*hours*days/1000*rate','Cost=(W×hours×days/1000)×price/kWh')
f('Computing','resistor-series','Series Resistors Calculator','Find equivalent resistance for three series resistors.','a|Resistor 1|100|Ω;b|Resistor 2|220|Ω;c|Resistor 3|330|Ω','Equivalent resistance|a+b+c|Ω','R_eq=R₁+R₂+R₃')
f('Computing','resistor-parallel','Parallel Resistors Calculator','Find equivalent resistance for three parallel resistors.','a|Resistor 1|100|Ω;b|Resistor 2|220|Ω;c|Resistor 3|330|Ω','Equivalent resistance|1/(1/a+1/b+1/c)|Ω','1/R_eq=1/R₁+1/R₂+1/R₃')
f('Computing','frequency-wavelength','Frequency to Wavelength','Convert electromagnetic wave frequency to wavelength in vacuum.','f|Frequency|100000000|Hz','Wavelength|299792458/f|m','λ = c/f (in vacuum)')
f('Computing','compression-ratio','Compression Ratio Calculator','Calculate file compression ratio and size reduction.','original|Original bytes|2000000;compressed|Compressed bytes|750000','Ratio|original/compressed;Size reduction|100*(1-compressed/original)|%','Reduction=(1−compressed/original)×100')
# Fitness informational (nonmedical)
f('Everyday','fuel-cost','Fuel Cost Calculator','Estimate fuel usage and trip fuel cost.','km|Trip distance|350|km;kmpl|Fuel efficiency|16|km/L;price|Price per litre|105','Fuel required|km/kmpl|L;Total cost|km/kmpl*price','Fuel=distance/efficiency; Cost=fuel×price')
f('Everyday','bmi-calculator','BMI Calculator','Compute body mass index from mass and height.','kg|Body mass|70|kg;cm|Height|175|cm','BMI|kg/(cm/100)^2','BMI=mass(kg)/height(m)²','BMI is a screening measure, not a diagnosis; it does not represent body composition.')
f('Everyday','recipe-scaler','Recipe Scaling Calculator','Scale an ingredient amount to a new serving count.','q|Ingredient amount|250;old|Original servings|4;new|New servings|7','Required quantity|q*new/old','New quantity=old quantity×(new servings / original servings)')
f('Everyday','pace-calculator','Running Pace Calculator','Calculate time per kilometer and average running speed.','distance|Distance|5|km;minutes|Time taken|30|min','Pace|min utes' if False else 'Pace|minutes/distance|min/km;Speed|distance/(minutes/60)|km/h','Pace=time/distance')
f('Everyday','paint-coverage','Paint Coverage Calculator','Estimate liters needed based on wall area and coverage.','area|Wall area|65|m²;coverage|Coverage per litre|10|m²/L;coats|Coats|2','Paint required|area*coats/coverage|L','Litres=(area×coats)/coverage','Add a margin for wastage and wall texture.')
f('Everyday','tile-calculator','Tile Quantity Calculator','Estimate tiles required for a given area.','floor|Floor area|15|m²;tilew|Tile width|0.6|m;tileh|Tile length|0.6|m;waste|Waste allowance|10|%','Tiles required|ceil(floor/(tilew*tileh)*(1+waste/100))','Tiles=ceil(area/(tile area)×(1+waste))')
# Fix accidental quote/lookup
for t in C:
    if t['slug']=='pace-calculator':
        t['outputs']=[{'label':'Pace','expr':'minutes/distance','unit':'min/km'},{'label':'Speed','expr':'distance/(minutes/60)','unit':'km/h'}]
# assemble
cats={
'Math & numbers':('hash','Basic math, fractions, percentages and number theory'),
'Algebra':('sigma','Equations, polynomials and sequences'),
'Graphing & calculus':('chart','Plots, derivatives and integrals'),
'Geometry':('shapes','Shapes, area, volume and geometry'),
'Trigonometry':('triangle','Angles, triangles and trig functions'),
'Physics':('atom','Motion, energy, mechanics and electricity'),
'Linear algebra':('grid','Matrices and vectors'),
'Statistics':('bars','Descriptive and inferential statistics'),
'Finance':('wallet','Interest, loans, investments and taxes'),
'Converters':('arrows','Measurement units and conversions'),
'Computing':('cpu','Digital technology and engineering math'),
'Education':('graduation','Grades, attendance and academic planning'),
'Date & time':('calendar','Time and calendar arithmetic'),
'Everyday':('sparkle','Useful real-life everyday calculations'),
}
from collections import Counter
print("DUPLICATES",[(k,v) for k,v in Counter(t["slug"] for t in C).items() if v>1])
assert len({t['slug'] for t in C})==len(C)
from pathlib import Path
root=Path(__file__).parent
(root/'assets'/'catalog.json').write_text(json.dumps({'categories':[{'name':k,'icon':v[0],'description':v[1]} for k,v in cats.items()],'tools':C},ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(len(C), 'total tools', len(cats),'categories')
print({k:sum(t['category']==k for t in C) for k in cats})
