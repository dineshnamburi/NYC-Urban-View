use warnings;
use Data::Dumper;
use JSON;
 
my $filename = 'rawData/crime_data.json';
open(my $fh, '<:encoding(UTF-8)', $filename)
  or die "Could not open file '$filename' $!";
 
while (my $row = <$fh>) {
  chomp $row;
  #print "$row\n";
  my $json = JSON->new;
  #my $jdata = $json->decode($row);
  my @jdata = @{decode_json($row)};
  print Dumper($jdata);
  #print $data;
  my $in_data = $jdata->{'data'};
  #print Dumper($in_data);
  my $ct = 0;
	while (my ($k,$v)=each %$in_data){
		#print Dumper($v);
		#print ($v->{'pct'});
		$ct = $ct+1;
		#print "update nypp set population=$v->{'pop'},crimes=$v->{'crime_count'},crime_rate=$v->{'per1000'} where precinct= $v->{'pct'} ;";
		#print ($v->{'crime_count123'}.'\n');
	}
	print $ct;
}