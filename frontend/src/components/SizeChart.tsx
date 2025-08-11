import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { 
  Ruler, 
  Lightbulb, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SizeChartProps {
  trigger?: React.ReactNode;
}

interface SizeData {
  size: string;
  chest: string;
  length: string;
  shoulders: string;
  sleeves: string;
}

interface UserMeasurements {
  chest: number;
  waist: number;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
}

const SizeChart: React.FC<SizeChartProps> = ({ trigger }) => {
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurements>({
    chest: 0,
    waist: 0,
    height: 0,
    weight: 0,
    age: 0,
    gender: 'male'
  });
  const [recommendedSize, setRecommendedSize] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const sizeChartData: SizeData[] = [
    { size: 'XS', chest: '32-34"', length: '26"', shoulders: '15"', sleeves: '8.5"' },
    { size: 'S', chest: '34-36"', length: '27"', shoulders: '16"', sleeves: '9"' },
    { size: 'M', chest: '36-38"', length: '28"', shoulders: '17"', sleeves: '9.5"' },
    { size: 'L', chest: '38-40"', length: '29"', shoulders: '18"', sleeves: '10"' },
    { size: 'XL', chest: '40-42"', length: '30"', shoulders: '19"', sleeves: '10.5"' },
    { size: 'XXL', chest: '42-44"', length: '31"', shoulders: '20"', sleeves: '11"' },
    { size: 'XXXL', chest: '44-46"', length: '32"', shoulders: '21"', sleeves: '11.5"' },
  ];

  const handleInputChange = (field: keyof UserMeasurements, value: string | number) => {
    setUserMeasurements(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const calculateSizeRecommendation = () => {
    // AI-powered size recommendation algorithm
    const { chest, waist, height, weight, age, gender } = userMeasurements;
    
    if (chest === 0 || waist === 0 || height === 0 || weight === 0) {
      return;
    }

    // Calculate body mass index (BMI) - can be used for future enhancements
    // const heightInMeters = height / 39.37; // Convert inches to meters
    // const weightInKg = weight / 2.20462; // Convert pounds to kg
    // const bmi = weightInKg / (heightInMeters * heightInMeters);

    // Calculate body type based on chest-to-waist ratio
    const chestToWaistRatio = chest / waist;
    
    // Size recommendation logic
    let recommendedSize = '';
    let confidenceScore = 0;

    if (gender === 'male') {
      if (chest <= 34) {
        recommendedSize = 'XS';
        confidenceScore = 85;
      } else if (chest <= 36) {
        recommendedSize = 'S';
        confidenceScore = 90;
      } else if (chest <= 38) {
        recommendedSize = 'M';
        confidenceScore = 95;
      } else if (chest <= 40) {
        recommendedSize = 'L';
        confidenceScore = 90;
      } else if (chest <= 42) {
        recommendedSize = 'XL';
        confidenceScore = 85;
      } else if (chest <= 44) {
        recommendedSize = 'XXL';
        confidenceScore = 80;
      } else {
        recommendedSize = 'XXXL';
        confidenceScore = 75;
      }
    } else {
      // Female sizing adjustments
      if (chest <= 32) {
        recommendedSize = 'XS';
        confidenceScore = 85;
      } else if (chest <= 34) {
        recommendedSize = 'S';
        confidenceScore = 90;
      } else if (chest <= 36) {
        recommendedSize = 'M';
        confidenceScore = 95;
      } else if (chest <= 38) {
        recommendedSize = 'L';
        confidenceScore = 90;
      } else if (chest <= 40) {
        recommendedSize = 'XL';
        confidenceScore = 85;
      } else if (chest <= 42) {
        recommendedSize = 'XXL';
        confidenceScore = 80;
      } else {
        recommendedSize = 'XXXL';
        confidenceScore = 75;
      }
    }

    // Adjust confidence based on body type
    if (chestToWaistRatio > 1.1 && chestToWaistRatio < 1.3) {
      confidenceScore += 5; // Athletic build
    } else if (chestToWaistRatio > 0.9 && chestToWaistRatio < 1.1) {
      confidenceScore += 3; // Average build
    } else {
      confidenceScore -= 5; // Different body type
    }

    // Adjust for age (older adults might prefer looser fit)
    if (age > 50) {
      if (recommendedSize !== 'XXXL') {
        const nextSize = sizeChartData.findIndex(s => s.size === recommendedSize);
        if (nextSize < sizeChartData.length - 1) {
          recommendedSize = sizeChartData[nextSize + 1].size;
        }
      }
      confidenceScore -= 10;
    }

    // Ensure confidence is within bounds
    confidenceScore = Math.max(60, Math.min(100, confidenceScore));

    setRecommendedSize(recommendedSize);
    setConfidence(confidenceScore);
    setShowRecommendation(true);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 80) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Size Chart
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Size Chart & AI Size Recommendation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Size Recommendation Tool */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI-Powered Size Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={userMeasurements.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female' | 'other')}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={userMeasurements.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chest">Chest (inches)</Label>
                  <Input
                    id="chest"
                    type="number"
                    placeholder="38"
                    value={userMeasurements.chest || ''}
                    onChange={(e) => handleInputChange('chest', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (inches)</Label>
                  <Input
                    id="waist"
                    type="number"
                    placeholder="32"
                    value={userMeasurements.waist || ''}
                    onChange={(e) => handleInputChange('waist', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="70"
                    value={userMeasurements.height || ''}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (pounds)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="160"
                    value={userMeasurements.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={calculateSizeRecommendation}
                className="w-full"
                disabled={!userMeasurements.chest || !userMeasurements.waist || !userMeasurements.height || !userMeasurements.weight}
              >
                Get Size Recommendation
              </Button>

              {showRecommendation && recommendedSize && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Recommended Size: {recommendedSize}</h4>
                    <div className="flex items-center gap-2">
                      {getConfidenceIcon(confidence)}
                      <span className={`font-medium ${getConfidenceColor(confidence)}`}>
                        {confidence}% Confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on your measurements, we recommend size {recommendedSize}. 
                    {confidence < 80 && ' Consider trying the next size up for a more comfortable fit.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Size Chart Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Detailed Size Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Size</th>
                      <th className="text-left p-3 font-medium">Chest</th>
                      <th className="text-left p-3 font-medium">Length</th>
                      <th className="text-left p-3 font-medium">Shoulders</th>
                      <th className="text-left p-3 font-medium">Sleeves</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChartData.map((size, index) => (
                      <tr key={size.size} className={`border-b ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                        <td className="p-3 font-medium">
                          <Badge variant="outline">{size.size}</Badge>
                        </td>
                        <td className="p-3">{size.chest}</td>
                        <td className="p-3">{size.length}</td>
                        <td className="p-3">{size.shoulders}</td>
                        <td className="p-3">{size.sleeves}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Measurement Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How to Measure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Chest</h4>
                  <p className="text-sm text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape horizontal.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Waist</h4>
                  <p className="text-sm text-muted-foreground">
                    Measure around your natural waistline, keeping the tape comfortably loose.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Height</h4>
                  <p className="text-sm text-muted-foreground">
                    Stand straight against a wall and measure from the floor to the top of your head.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Weight</h4>
                  <p className="text-sm text-muted-foreground">
                    Weigh yourself on a scale, preferably in the morning before eating.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeChart;
