library('prada')
#library('log10')
setwd("/Users/mei/misd/gpcr/data");
files <- list.files(".", pattern = "*.fcs*", full.names=FALSE, ignore.case = TRUE);

for (i in 1:length(files)) {
filename1 = paste(paste("img",i, sep="_"), "png", sep='.')
png(filename1)
par(mfrow=c(2,2))
sample = readFCS(files[i]);
#if dealing with a PRO FILE: 
fdat = exprs(sample)
#----------------------------------------------
#logplot(fdat[, "FSC-HLog"], fdat[, "RED-HLog"], pch = 20,log="xy",ylim=c(0.1,5),xlim=c(1,4), col = "#303030",xlab = "FSC",ylab = "RED",main = "FSC-HLog vs RED-HLog")
d.f <- data.frame( x = fdat[, "FSC-HLog"], y = fdat[, "RED-HLog"] )
##  Open a new default device.
#get( getOption( "device" ) )()
##  Plot the data, hiding the points for now to prevent the calls to
##  abline() from drawing over the points.
plot(
    y ~ x,
    data = d.f,
    type = "n",
    log  = "xy",
    main = "FSC-HLog vs RED-HLog",
    xlim = c( 1, 4 ),
    ylim = c( 0.01, 4),
col="red",
xlab = "FSC-HLog",
ylab = "RED-HLog")
##  Put grid lines on the plot, using a light blue color ("lightsteelblue2").
abline(
    h   = c( seq( 1, 9, 1 ), seq( 10, 90, 10 ), seq( 100, 1000, 100 ) ),
    lty = 3,
    col = colors()[ 440 ] )
abline(
    v   = c( seq( 1, 9, 1 ), seq( 10, 90, 10 ), seq( 100, 1000, 100 ) ),
    lty = 3,
    col = colors()[ 440 ] )
##  Draw the points over the grid lines.
points( y ~ x, data = d.f )
##  Redraw the plot box over the grid lines.
box()


#logplot(fdat[, "GRN-HLog"], fdat[, "RED-HLog"],xlab = "GRN",ylab = "RED", yint="r",xint="r", log="xy",ylim=c(0.1,4),xlim=c(0.1,4), main = "GRN-HLog vs RED-HLog")
d.f <- data.frame( x = fdat[, "GRN-HLog"], y = fdat[, "RED-HLog"] )
##  Open a new default device.
#get( getOption( "device" ) )()
##  Plot the data, hiding the points for now to prevent the calls to
##  abline() from drawing over the points.
plot(
    y ~ x,
    data = d.f,
    type = "n",
    log  = "xy",
    main = "GRN-HLog vs RED-HLog",
    xlim = c( 0.01, 4 ),
    ylim = c( 0.01, 4),
col="red",
xlab = "GRN-HLog",
ylab = "RED-HLog")
##  Put grid lines on the plot, using a light blue color ("lightsteelblue2").
abline(
    h   = c( seq( 1, 9, 1 ), seq( 10, 90, 10 ), seq( 100, 1000, 100 ) ),
    lty = 3,
    col = colors()[ 440 ] )
abline(
    v   = c( seq( 1, 9, 1 ), seq( 10, 90, 10 ), seq( 100, 1000, 100 ) ),
    lty = 3,
    col = colors()[ 440 ] )
##  Draw the points over the grid lines.
points( y ~ x, data = d.f )
##  Redraw the plot box over the grid lines.
box()

abline(h=1.30) #20
abline(v=1.477) #30

hist(fdat[,3], breaks=128, xlab="GRN-HLog", ylab="Count", main="(488) Histogram of GRN-HLog", xlim=c(0,4),ylim=c(0,80))
abline(v=1.35)   # we want to use data greater than 36 for the second marker

#----------------------------------------------

hist(fdat[,4], breaks=128, xlab="YEL-HLog", ylab="Count", main="(GP64) Histogram of YEL-HLog", xlim=c(0,4),ylim=c(0,80))
abline(v=1)   # we want to use data greater than 10 for the first marker

#----------------------------------------------

dev.off()
}


